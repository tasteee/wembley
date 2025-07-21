import { describe, it, expect, beforeAll } from '@jest/globals'
import { wembley } from '../src'

describe('audio engine cancelScheduledValues fix', () => {
  let player: any
  let gear: any

  beforeAll(async () => {
    player = wembley.configure({
      gain: 70,
      maxVelocity: 85,
      minVelocity: 45,
      voicings: {
        jazzCluster: (notes) => notes.map((note) => note + '♭9'),
        arpeggiated: (notes) => notes.sort()
      }
    })

    gear = await player.load({
      piano: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-ogg.js'
    })
  })

  it('should play C3 note without cancelScheduledValues error', () => {
    // This test reproduces the original issue described in the bug report
    expect(() => {
      gear.piano.note('C3').play()
    }).not.toThrow()
  })

  it('should play C3 note with specific parameters without error', () => {
    // Test the specific scenario from the issue
    expect(() => {
      const note = gear.piano.note('C3').velocity(65).play()
      expect(note).toBeDefined()
      expect(note.stop).toBeDefined()
    }).not.toThrow()
  })

  it('should handle note with duration without cancelScheduledValues error', () => {
    expect(() => {
      gear.piano.note('C3').duration(500).play()
    }).not.toThrow()
  })

  it('should handle note with after delay without cancelScheduledValues error', () => {
    expect(() => {
      gear.piano.note('C3').after(100).play()
    }).not.toThrow()
  })

  it('should handle note with velocity range without cancelScheduledValues error', () => {
    expect(() => {
      gear.piano.note('C3').velocity(65, 85).play()
    }).not.toThrow()
  })

  it('should handle various note modifiers combined without error', () => {
    expect(() => {
      gear.piano.note('C3')
        .velocity(70)
        .after(100)
        .duration(250)
        .detune(-50)
        .attack(5)
        .release(100)
        .gain(50)
        .pan(-70)
        .play()
    }).not.toThrow()
  })
})