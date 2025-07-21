import type { InstrumentT, ConfigT, InstanceTrackerT } from './types.js'
import type { AudioSynthT, AudioVoiceT } from './audio-engine.js'
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

  const instanceTracker: InstanceTrackerT = {
    noteInstances: new Map(),
    chordInstances: new Map(),
    notesInstances: new Map(),
    allInstances: new Set()
  }

  const instrument: InstrumentT = {
    note: (note: string) => {
      return createNote({ 
        note, 
        synth: args.synth, 
        config: args.config,
        instanceTracker
      })
    },

    notes: (notes: string[]) => {
      return createNotes({ 
        notes, 
        synth: args.synth, 
        config: args.config,
        instanceTracker
      })
    },

    chord: (chord: string) => {
      return createChord({ 
        chord, 
        synth: args.synth, 
        config: args.config,
        instanceTracker
      })
    },

    stop: () => {
      console.log(`Stopping all sounds from instrument "${args.name}"`)
      args.synth.stopAllNotes()
      // Also stop all tracked instances
      instanceTracker.allInstances.forEach(voice => voice.stop())
      // Clear all tracking
      instanceTracker.noteInstances.clear()
      instanceTracker.chordInstances.clear()
      instanceTracker.notesInstances.clear()
      instanceTracker.allInstances.clear()
    }
  }

  return instrument
}