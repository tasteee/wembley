import type { InstrumentT, ConfigT } from './types.js'
import { createNote } from './note.js'
import { createNotes } from './notes.js'
import { createChord } from './chord.js'

export const createInstrument = (args: { name: string; soundfontUrl: string; config: ConfigT }) => {
  console.log(`Creating instrument "${args.name}" from ${args.soundfontUrl}`)

  const instrument: InstrumentT = {
    note: (note: string) => {
      return createNote({ note, config: args.config })
    },

    notes: (notes: string[]) => {
      return createNotes({ notes, config: args.config })
    },

    chord: (chord: string) => {
      return createChord({ chord, config: args.config })
    }
  }

  return instrument
}