import { describe, it, expect } from '@jest/globals'
import wembley from '../src'

describe('wembley default import (README example)', () => {
  it('should work with default import syntax from README', async () => {
    // This matches the exact example from README.md
    const player = wembley.configure({
      gain: 70,
      maxVelocity: 85,
      minVelocity: 45,
      voicings: {
        reversed: (notes) => notes.reverse(),
        only2and3: (notes) => [notes[1], notes[2]]
      }
    })

    const gear = await player.load({
      piano: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-ogg.js',
      dustyGuitar: 'https://raw.githubusercontent.com/felixroos/felixroos.github.io/main/public/Earthbound_NEW.sf2',
    })

    expect(gear.piano).toBeDefined()
    expect(gear.dustyGuitar).toBeDefined()

    expect(gear.piano.note).toBeDefined()
    expect(gear.piano.notes).toBeDefined()
    expect(gear.piano.chord).toBeDefined()

    // how to expect no errors to happen in the following code???

    expect(() => {
      gear.piano.note('C3').play()
      gear.piano.note('C3').stop()
      const note = gear.piano.note('C3').velocity(65).play()
      note.stop()
      gear.piano.note('C3').velocity(65, 85).play()
      gear.piano.note('C3').after(100).play()
      gear.piano.note('C3').duration(250).play()
    }).not.toThrow()
  })
})