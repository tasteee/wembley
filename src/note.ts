import type { NoteT, PlayingNoteT, ConfigT } from './types.js'
import type { AudioSynthT } from './audio-engine.js'
import { noteToMidi } from './utils/note-parser.js'

type NoteStateT = {
  note: string
  velocity: number
  minVelocity?: number
  maxVelocity?: number
  afterMs: number
  durationMs?: number
  detuneCents: number
  attackMs?: number
  releaseMs?: number
  gain: number
  pan: number
}

export const createNote = (args: { note: string; synth: AudioSynthT; config: ConfigT }) => {
  const state: NoteStateT = {
    note: args.note,
    velocity: args.config.minVelocity || 45,
    afterMs: 0,
    detuneCents: 0,
    gain: args.config.gain || 70,
    pan: 0
  }

  const noteInstance: NoteT = {
    velocity: ((vel: number, maxVel?: number) => {
      if (maxVel !== undefined) {
        state.minVelocity = vel
        state.maxVelocity = maxVel
        // Use random velocity between min and max
        state.velocity = Math.random() * (maxVel - vel) + vel
      } else {
        state.velocity = vel
      }
      return noteInstance
    }) as NoteT['velocity'],

    after: (ms: number) => {
      state.afterMs = ms
      return noteInstance
    },

    duration: (ms: number) => {
      state.durationMs = ms
      return noteInstance
    },

    detune: (cents: number) => {
      state.detuneCents = cents
      return noteInstance
    },

    attack: (ms: number) => {
      state.attackMs = ms
      return noteInstance
    },

    release: (ms: number) => {
      state.releaseMs = ms
      return noteInstance
    },

    gain: (gain: number) => {
      state.gain = gain
      return noteInstance
    },

    pan: (pan: number) => {
      state.pan = pan
      return noteInstance
    },

    play: () => {
      return createPlayingNote({ state, synth: args.synth })
    },

    stop: () => {
      // Immediate stop - would stop any currently playing instances
      console.log(`Stopping note ${state.note} immediately`)
    }
  }

  return noteInstance
}

const createPlayingNote = (args: { state: NoteStateT; synth: AudioSynthT }) => {
  const playingState = {
    afterMs: 0,
    gain: args.state.gain,
    pan: args.state.pan
  }

  // Convert note to MIDI and play with Web Audio
  const midi = noteToMidi({ note: args.state.note })
  
  const startTime = args.state.afterMs > 0 
    ? args.state.afterMs / 1000  // Convert ms to seconds for relative timing
    : undefined

  console.log(`Playing note ${args.state.note} (MIDI ${midi}) with velocity ${args.state.velocity}`)
  
  if (args.state.afterMs > 0) {
    console.log(`  After ${args.state.afterMs}ms`)
  }
  
  if (args.state.durationMs) {
    console.log(`  Duration: ${args.state.durationMs}ms`)
  }

  // Play the note using the audio synth
  const voice = args.synth.playNote({
    midi,
    velocity: args.state.velocity,
    startTime,
    duration: args.state.durationMs,
    detune: args.state.detuneCents,
    attack: args.state.attackMs,
    release: args.state.releaseMs,
    gain: args.state.gain,
    pan: args.state.pan
  })

  const playingNote: PlayingNoteT = {
    after: (ms: number) => {
      playingState.afterMs = ms
      return playingNote
    },

    gain: (gain: number) => {
      playingState.gain = gain
      return playingNote
    },

    pan: (pan: number) => {
      playingState.pan = pan
      return playingNote
    },

    stop: () => {
      if (playingState.afterMs > 0) {
        console.log(`Stopping note ${args.state.note} after ${playingState.afterMs}ms`)
        console.log(`  Transitioning to gain: ${playingState.gain}, pan: ${playingState.pan}`)
        
        // Apply modulations before stopping
        setTimeout(() => {
          voice.modulate({
            gain: playingState.gain,
            pan: playingState.pan,
            duration: playingState.afterMs
          })
          
          setTimeout(() => {
            voice.stop()
          }, playingState.afterMs)
        }, 0)
      } else {
        console.log(`Stopping note ${args.state.note} immediately`)
        voice.stop()
      }
    }
  }

  return playingNote
}