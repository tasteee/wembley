import { transposeNote } from './note-parser.js'

export const parseChord = (args: { chord: string }) => {
  const chordRegex = /^([A-G][#b]?)(.*)$/
  const match = args.chord.match(chordRegex)
  
  if (!match) {
    throw new Error(`Invalid chord format: ${args.chord}`)
  }
  
  const [, root, quality] = match
  
  return {
    root,
    quality: quality || 'major'
  }
}

export const getChordNotes = (args: { chord: string; octave?: number }) => {
  const { root, quality } = parseChord(args)
  const octave = args.octave || 4
  const rootNote = `${root}${octave}`
  
  // Basic chord patterns (intervals from root)
  const chordIntervals: Record<string, number[]> = {
    'major': [0, 4, 7],
    '': [0, 4, 7], // Default to major
    'm': [0, 3, 7],
    'min': [0, 3, 7],
    'minor': [0, 3, 7],
    'dim': [0, 3, 6],
    'aug': [0, 4, 8],
    '7': [0, 4, 7, 10],
    'maj7': [0, 4, 7, 11],
    'm7': [0, 3, 7, 10],
    'dim7': [0, 3, 6, 9],
    'sus2': [0, 2, 7],
    'sus4': [0, 5, 7],
    'add9': [0, 4, 7, 14],
    '9': [0, 4, 7, 10, 14],
    '11': [0, 4, 7, 10, 14, 17],
    '13': [0, 4, 7, 10, 14, 17, 21]
  }
  
  const intervals = chordIntervals[quality] || chordIntervals['major']
  
  return intervals.map(interval => 
    transposeNote({ note: rootNote, semitones: interval })
  )
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