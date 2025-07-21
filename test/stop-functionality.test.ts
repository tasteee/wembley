import { describe, test, expect, beforeAll, jest } from '@jest/globals'
import { createWembley } from '../src/wembley.js'
import type { GearT } from '../src/types.js'

// Mock console.log to capture stop messages
const originalConsoleLog = console.log
let capturedLogs: string[] = []

beforeAll(() => {
  console.log = jest.fn().mockImplementation((message: string) => {
    capturedLogs.push(message)
    originalConsoleLog(message)
  })
})

describe('Stop Functionality', () => {
  let gear: GearT

  beforeAll(async () => {
    const wembley = createWembley()
    const player = wembley.configure({
      gain: 70,
      minVelocity: 45,
      maxVelocity: 85
    })

    // Load a test instrument
    gear = await player.load({
      testInstrument: 'https://example.com/test.sf2'
    })

    // Clear logs from setup
    capturedLogs = []
  })

  test('gear.stop() should stop all instruments globally', () => {
    gear.stop()
    
    expect(capturedLogs).toContain('Stopping all sounds from all instruments')
    expect(capturedLogs).toContain('Stopping all sounds from instrument "testInstrument"')
    capturedLogs = []
  })

  test('gear.instrument.stop() should stop all sounds from specific instrument', () => {
    gear.testInstrument.stop()
    
    expect(capturedLogs).toContain('Stopping all sounds from instrument "testInstrument"')
    capturedLogs = []
  })

  test('gear.instrument.note().stop() should log for unplayed note instance', () => {
    gear.testInstrument.note('C3').stop()
    
    expect(capturedLogs).toContain('Stopping note C3 immediately')
    capturedLogs = []
  })

  test('gear.instrument.chord().stop() should log for unplayed chord instance', () => {
    gear.testInstrument.chord('Cmaj').stop()
    
    expect(capturedLogs).toContain('Stopping chord Cmaj (C4, E4, G4) immediately')
    capturedLogs = []
  })

  test('gear.instrument.notes().stop() should log for unplayed notes instance', () => {
    gear.testInstrument.notes(['C3', 'E3', 'G3']).stop()
    
    expect(capturedLogs).toContain('Stopping notes C3, E3, G3 immediately')
    capturedLogs = []
  })

  test('playing instance stop methods should work', () => {
    // These would require actual Web Audio API to test fully
    // For now, we'll just verify they don't throw errors
    
    expect(() => {
      const playingNote = gear.testInstrument.note('C3').play()
      playingNote.stop()
    }).not.toThrow()

    expect(() => {
      const playingChord = gear.testInstrument.chord('Cmaj').play()
      playingChord.stop()
    }).not.toThrow()

    expect(() => {
      const playingNotes = gear.testInstrument.notes(['C3', 'E3', 'G3']).play()
      playingNotes.stop()
    }).not.toThrow()

    // Clear any logs from playing
    capturedLogs = []
  })
})
