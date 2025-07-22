import { describe, it, expect, beforeAll } from '@jest/globals'
import { getGear } from './test-helpers'

describe('audio engine cancelScheduledValues fix', () => {
  it('should play C3 note without cancelScheduledValues error', async () => {
    const gear = await getGear()
    // This test reproduces the original issue described in the bug report
    expect(() => {
      gear.piano.note('C3').play()
    }).not.toThrow()
  })

  it('should play C3 note with specific parameters without error', async () => {
    const gear = await getGear()
    // Test the specific scenario from the issue
    expect(() => {
      const note = gear.piano.note('C3').velocity(65).play()
      expect(note).toBeDefined()
      expect(note.stop).toBeDefined()
    }).not.toThrow()
  })

  it('should handle note with duration without cancelScheduledValues error', async () => {
    const gear = await getGear()
    expect(() => {
      gear.piano.note('C3').duration(500).play()
    }).not.toThrow()
  })

  it('should handle note with after delay without cancelScheduledValues error', async () => {
    const gear = await getGear()
    expect(() => {
      gear.piano.note('C3').after(100).play()
    }).not.toThrow()
  })

  it('should handle note with velocity range without cancelScheduledValues error', async () => {
    const gear = await getGear()
    expect(() => {
      gear.piano.note('C3').velocity(65, 85).play()
    }).not.toThrow()
  })

  it('should handle various note modifiers combined without error', async () => {
    const gear = await getGear()
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