import { describe, it, expect } from 'bun:test'
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
      piano: 'https://url.to/piano.sf2',
      dustyGuitar: '/sounds/dusty_guitar.sf2',
    })

    // Play a note. Stop a note.
    gear.piano.note('C3').play()
    gear.piano.note('C3').stop()

    // Play a note. Get a note. Stop that note.
    const note = gear.piano.note('C3').velocity(65).play()
    note.stop()

    // Play a note, but with swagger.
    gear.piano.note('C3').velocity(65, 85).play()
    gear.piano.note('C3').after(100).play()
    gear.piano.note('C3').duration(250).play()

    expect(gear.piano).toBeDefined()
    expect(gear.dustyGuitar).toBeDefined()
  })
})