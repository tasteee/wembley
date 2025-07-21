import { describe, it, expect } from '@jest/globals'
import { wembley } from '../src'

describe('wembley API', () => {
  it('should configure and create a player', () => {
    const player = wembley.configure({
      gain: 70,
      maxVelocity: 85,
      minVelocity: 45,
      voicings: {
        reversed: (notes) => notes.reverse(),
        only2and3: (notes) => [notes[1], notes[2]]
      }
    })
    
    expect(player).toBeDefined()
    expect(player.load).toBeDefined()
    expect(typeof player.load).toBe('function')
  })

  it('should load soundfonts and create gear', async () => {
    const player = wembley.configure()
    
    const gear = await player.load({
      piano: 'https://url.to/piano.sf2',
      dustyGuitar: '/sounds/dusty_guitar.sf2'
    })
    
    expect(gear).toBeDefined()
    expect(gear.piano).toBeDefined()
    expect(gear.dustyGuitar).toBeDefined()
    expect(gear.piano.note).toBeDefined()
    expect(gear.piano.notes).toBeDefined()
    expect(gear.piano.chord).toBeDefined()
  })

  it('should play single notes with chaining', async () => {
    const player = wembley.configure()
    const gear = await player.load({ piano: '/piano.sf2' })
    
    // Test basic note playing
    const note = gear.piano.note('C3').velocity(65).play()
    expect(note).toBeDefined()
    expect(note.stop).toBeDefined()
    
    // Test note with velocity range
    gear.piano.note('C3').velocity(65, 85).play()
    
    // Test note with delay and duration
    gear.piano.note('C3').after(100).duration(250).play()
  })

  it('should play multiple notes with stagger', async () => {
    const player = wembley.configure()
    const gear = await player.load({ dustyGuitar: '/dusty_guitar.sf2' })
    
    // Test basic notes playing
    gear.dustyGuitar.notes(['C3', 'E4']).play()
    
    // Test notes with stagger
    gear.dustyGuitar.notes(['C3', 'E4']).stagger(150).play()
    
    // Test notes with velocity and delay
    gear.dustyGuitar.notes(['C3', 'E4']).velocity(65).after(150).play()
  })

  it('should play chords with various options', async () => {
    const player = wembley.configure()
    const gear = await player.load({ piano: '/piano.sf2' })
    
    // Test basic chord
    gear.piano.chord('C#m').play()
    
    // Test chord with stagger
    gear.piano.chord('C#m').stagger(200).play()
    
    // Test chord with modifications
    gear.piano.chord('F#')
      .octave(3)
      .inversion(1)
      .voicing('cluster')
      .bassNote('B')
      .play()
  })

  it('should handle all voicing types', async () => {
    const player = wembley.configure()
    const gear = await player.load({ piano: '/piano.sf2' })
    
    const voicings = [
      'open', 'closed', 'drop2', 'drop3', 'drop2and4',
      'rootless', 'spread', 'cluster', 'shell',
      'pianistic', 'guitaristic', 'orchestral'
    ]
    
    for (const voicing of voicings) {
      gear.piano.chord('Cmaj7').voicing(voicing as any).play()
    }
  })

  it('should handle custom voicings from config', async () => {
    const player = wembley.configure({
      voicings: {
        reversed: (notes) => notes.reverse(),
        only2and3: (notes) => [notes[1], notes[2]]
      }
    })
    
    const gear = await player.load({ piano: '/piano.sf2' })
    
    gear.piano.chord('Cmaj7').voicing('reversed').play()
    gear.piano.chord('Cmaj7').voicing('only2and3').play()
  })

  it('should handle playing note stop with transitions', async () => {
    const player = wembley.configure()
    const gear = await player.load({ piano: '/piano.sf2' })
    
    const note = gear.piano.note('C3').play()
    
    // Test immediate stop
    note.stop()
    
    // Test delayed stop with transitions
    const anotherNote = gear.piano.note('D3').play()
    anotherNote.after(300).gain(0).pan(30).stop()
  })
})
