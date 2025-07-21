export const parseNote = (args: { note: string }) => {
  const noteRegex = /^([A-G])([#b]?)(\d+)$/
  const match = args.note.match(noteRegex)
  
  if (!match) {
    throw new Error(`Invalid note format: ${args.note}`)
  }
  
  const [, noteName, accidental, octaveStr] = match
  const octave = parseInt(octaveStr, 10)
  
  return {
    noteName,
    accidental: accidental || '',
    octave,
    fullNote: args.note
  }
}

export const noteToMidi = (args: { note: string }) => {
  const { noteName, accidental, octave } = parseNote(args)
  
  const noteOffsets = {
    C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11
  }
  
  const baseOffset = noteOffsets[noteName as keyof typeof noteOffsets]
  const accidentalOffset = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0
  
  return (octave + 1) * 12 + baseOffset + accidentalOffset
}

export const midiToNote = (args: { midi: number }) => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octave = Math.floor(args.midi / 12) - 1
  const noteIndex = args.midi % 12
  
  return `${noteNames[noteIndex]}${octave}`
}

export const transposeNote = (args: { note: string; semitones: number }) => {
  const midi = noteToMidi({ note: args.note })
  return midiToNote({ midi: midi + args.semitones })
}