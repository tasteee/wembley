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

describe('Enhanced Stop Functionality', () => {
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

  test('gear.instrument.notes().stop() should stop all notes', () => {
    gear.testInstrument.notes(['C3', 'E3', 'G3']).stop()
    
    expect(capturedLogs).toContain('Stopping notes C3, E3, G3 immediately')
    capturedLogs = []
  })

  test('gear.instrument.notes().stop("C3") should stop only C3', () => {
    gear.testInstrument.notes(['C3', 'E3', 'G3']).stop('C3')
    
    expect(capturedLogs).toContain('Stopping note C3 from notes C3, E3, G3')
    capturedLogs = []
  })

  test('multiple instances of same note should be tracked independently', () => {
    // These should not throw errors
    expect(() => {
      const instance1 = gear.testInstrument.note('C3').play()
      const instance2 = gear.testInstrument.note('C3').play()
      
      // Stop only instance1 - instance2 should continue playing
      instance1.stop()
      
      // Then stop the second instance
      instance2.stop()
    }).not.toThrow()

    capturedLogs = []
  })

  test('chord.stop() should stop all instances of that chord', () => {
    // Create multiple instances of the same chord
    const chord1 = gear.testInstrument.chord('Cmaj').play()
    const chord2 = gear.testInstrument.chord('Cmaj').play()
    
    // Stop all instances of Cmaj chord
    gear.testInstrument.chord('Cmaj').stop()
    
    expect(capturedLogs).toContain('Stopping chord Cmaj (C4, E4, G4) immediately')
    capturedLogs = []
  })

  test('note.stop() should stop all instances of that specific note', () => {
    // Create multiple instances of C3
    const note1 = gear.testInstrument.note('C3').play()
    const note2 = gear.testInstrument.note('C3').play()
    
    // Stop all instances of C3
    gear.testInstrument.note('C3').stop()
    
    expect(capturedLogs).toContain('Stopping note C3 immediately')
    capturedLogs = []
  })

  test('instrument.stop() should clean up all tracking', () => {
    // Create various instances
    const note1 = gear.testInstrument.note('C3').play()
    const chord1 = gear.testInstrument.chord('Cmaj').play()
    const notes1 = gear.testInstrument.notes(['D3', 'F3']).play()
    
    // Stop the instrument - should clean up everything
    gear.testInstrument.stop()
    
    expect(capturedLogs).toContain('Stopping all sounds from instrument "testInstrument"')
    capturedLogs = []
  })

  test('gear.stop() should clean up all instruments', () => {
    // Create various instances
    const note1 = gear.testInstrument.note('C3').play()
    const chord1 = gear.testInstrument.chord('Cmaj').play()
    
    // Stop all gear
    gear.stop()
    
    expect(capturedLogs).toContain('Stopping all sounds from all instruments')
    expect(capturedLogs).toContain('Stopping all sounds from instrument "testInstrument"')
    capturedLogs = []
  })
})