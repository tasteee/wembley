import { Note, Midi, Interval } from 'tonal'

export const parseNote = (args: { note: string }) => {
  const parsed = Note.get(args.note)
  
  if (!parsed.name) {
    throw new Error(`Invalid note format: ${args.note}`)
  }
  
  return {
    noteName: parsed.pc || parsed.letter || '',
    accidental: parsed.acc || '',
    octave: parsed.oct || 4,
    fullNote: parsed.name
  }
}

export const noteToMidi = (args: { note: string }) => {
  const midi = Midi.toMidi(args.note)
  if (midi === null) {
    throw new Error(`Cannot convert note to MIDI: ${args.note}`)
  }
  return midi
}

export const midiToNote = (args: { midi: number }) => {
  const note = Midi.midiToNoteName(args.midi)
  if (!note) {
    throw new Error(`Cannot convert MIDI to note: ${args.midi}`)
  }
  return note
}

export const transposeNote = (args: { note: string; semitones: number }) => {
  // Use MIDI conversion as it's more reliable for semitone transpositions
  const midi = noteToMidi(args)
  return midiToNote({ midi: midi + args.semitones })
}