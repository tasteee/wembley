import type { InstrumentT, ConfigT } from './types.js'
import type { AudioSynthT } from './audio-engine.js'
import { createNote } from './note.js'
import { createNotes } from './notes.js'
import { createChord } from './chord.js'

export const createInstrument = (args: { 
  name: string
  soundfontUrl: string
  synth: AudioSynthT
  config: ConfigT 
}) => {
  console.log(`Creating instrument "${args.name}" from ${args.soundfontUrl}`)

  const instrument: InstrumentT = {
    note: (note: string) => {
      return createNote({ note, synth: args.synth, config: args.config })
    },

    notes: (notes: string[]) => {
      return createNotes({ notes, synth: args.synth, config: args.config })
    },

    chord: (chord: string) => {
      return createChord({ chord, synth: args.synth, config: args.config })
    },

    stop: () => {
      console.log(`Stopping all sounds from instrument "${args.name}"`)
      args.synth.stopAllNotes()
    }
  }

  return instrument
}