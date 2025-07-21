import { Chord, Note } from 'tonal'
import { transposeNote } from './note-parser.js'

export const parseChord = (args: { chord: string }) => {
  const chordData = Chord.get(args.chord)
  
  if (!chordData.tonic) {
    throw new Error(`Invalid chord format: ${args.chord}`)
  }
  
  return {
    root: chordData.tonic,
    quality: chordData.quality
  }
}

export const getChordNotes = (args: { chord: string; octave?: number }) => {
  const octave = args.octave || 4
  const chordData = Chord.get(args.chord)
  
  if (!chordData.tonic) {
    throw new Error(`Invalid chord format: ${args.chord}`)
  }
  
  // Get chord notes from tonal
  let chordNotes = chordData.notes
  
  // If tonal didn't give us any notes, fall back to basic patterns
  if (chordNotes.length === 0) {
    const basicChords: Record<string, string[]> = {
      'M': ['1P', '3M', '5P'], // Major
      '': ['1P', '3M', '5P'], // Default major
      'm': ['1P', '3m', '5P'], // Minor
      'dim': ['1P', '3m', '5d'], // Diminished
      'aug': ['1P', '3M', '5A'], // Augmented
      '7': ['1P', '3M', '5P', '7m'], // Dominant 7th
      'M7': ['1P', '3M', '5P', '7M'], // Major 7th
      'm7': ['1P', '3m', '5P', '7m'], // Minor 7th
    }
    
    const rootNote = `${chordData.tonic}${octave}`
    const intervals = basicChords[chordData.quality] || basicChords['M']
    return intervals.map(interval => 
      Note.transpose(rootNote, interval)
    ).filter(Boolean)
  }
  
  // Add octave to each note
  return chordNotes.map(note => `${note}${octave}`)
}

export const applyInversion = (args: { notes: string[]; inversion: number }) => {
  const inversionCount = args.inversion % args.notes.length
  const inverted = [...args.notes]
  
  for (let i = 0; i < inversionCount; i++) {
    const note = inverted.shift()
    if (note) {
      // Move the note up an octave
      const transposed = transposeNote({ note, semitones: 12 })
      inverted.push(transposed)
    }
  }
  
  return inverted
}