import { wembley } from '../src/index.js'

describe('Soundfont Integration', () => {
  test('should load and play soundfont instruments instead of synthetic sounds', async () => {
    // Configure wembley
    const player = wembley.configure({
      gain: 70,
      maxVelocity: 85,
      minVelocity: 45,
    })

    // Load soundfonts - using pre-converted instrument names that soundfont-player supports
    const gear = await player.load({
      piano: 'acoustic_grand_piano',
      guitar: 'acoustic_guitar_nylon'
    })

    // Verify instruments were loaded
    expect(gear.piano).toBeDefined()
    expect(gear.guitar).toBeDefined()

    // Test playing notes - in mock environment this will log soundfont activity
    const note1 = gear.piano.note('C3').play()
    const note2 = gear.guitar.note('E4').play()

    // Verify notes can be stopped
    note1.stop()
    note2.stop()

    expect(note1).toBeDefined()
    expect(note2).toBeDefined()
  })

  test('should warn when attempting to load .sf2 files directly', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    
    const player = wembley.configure({ gain: 70 })
    
    // Load a .sf2 file URL - this should trigger a warning
    const gear = await player.load({
      customInstrument: 'https://example.com/test-instrument.sf2'
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Direct .sf2 file loading is not yet supported')
    )

    // Should still create an instrument (with fallback)
    expect(gear.customInstrument).toBeDefined()

    consoleSpy.mockRestore()
  })

  test('should handle custom soundfont URLs (pre-converted files)', async () => {
    const player = wembley.configure({ gain: 50 })
    
    // Load a custom pre-converted soundfont file
    const gear = await player.load({
      customPiano: 'https://example.com/custom-piano-ogg.js'
    })

    expect(gear.customPiano).toBeDefined()
    
    // Test playing with the custom instrument
    const note = gear.customPiano.note('A4').velocity(80).play()
    expect(note).toBeDefined()
    
    note.stop()
  })

  test('should maintain API compatibility with original interface', async () => {
    const player = wembley.configure({
      gain: 60,
      voicings: {
        reversed: (notes: string[]) => notes.reverse()
      }
    })

    const gear = await player.load({
      testInstrument: 'marimba'
    })

    // Test all the original API methods still work
    const singleNote = gear.testInstrument.note('C4').velocity(75).after(100).duration(500).play()
    expect(singleNote).toBeDefined()
    
    const multipleNotes = gear.testInstrument.notes(['C4', 'E4', 'G4']).velocity(60).play()
    expect(multipleNotes).toBeDefined()
    
    const chord = gear.testInstrument.chord('Cmaj').velocity(70).play()
    expect(chord).toBeDefined()
    
    // Test stop functionality
    singleNote.stop()
    multipleNotes.stop()
    chord.stop()
    
    // Test instrument stop
    gear.testInstrument.stop()
    
    // Test gear-wide stop
    gear.stop()
  })
})