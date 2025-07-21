import type { NotesT, PlayingNotesT, ConfigT } from './types.js'

type NotesStateT = {
  notes: string[]
  velocity: number
  minVelocity?: number
  maxVelocity?: number
  afterMs: number
  durationMs?: number
  staggerMs: number
  detuneCents: number
  attackMs?: number
  releaseMs?: number
  gain: number
  pan: number
}

export const createNotes = (args: { notes: string[]; config: ConfigT }) => {
  const state: NotesStateT = {
    notes: args.notes,
    velocity: args.config.minVelocity || 45,
    afterMs: 0,
    staggerMs: 0,
    detuneCents: 0,
    gain: args.config.gain || 70,
    pan: 0
  }

  const notesInstance: NotesT = {
    velocity: ((vel: number, maxVel?: number) => {
      if (maxVel !== undefined) {
        state.minVelocity = vel
        state.maxVelocity = maxVel
        // Use random velocity between min and max
        state.velocity = Math.random() * (maxVel - vel) + vel
      } else {
        state.velocity = vel
      }
      return notesInstance
    }) as NotesT['velocity'],

    after: (ms: number) => {
      state.afterMs = ms
      return notesInstance
    },

    duration: (ms: number) => {
      state.durationMs = ms
      return notesInstance
    },

    stagger: (ms: number) => {
      state.staggerMs = ms
      return notesInstance
    },

    detune: (cents: number) => {
      state.detuneCents = cents
      return notesInstance
    },

    attack: (ms: number) => {
      state.attackMs = ms
      return notesInstance
    },

    release: (ms: number) => {
      state.releaseMs = ms
      return notesInstance
    },

    gain: (gain: number) => {
      state.gain = gain
      return notesInstance
    },

    pan: (pan: number) => {
      state.pan = pan
      return notesInstance
    },

    play: () => {
      return createPlayingNotes({ state })
    },

    stop: () => {
      console.log(`Stopping notes ${state.notes.join(', ')} immediately`)
    }
  }

  return notesInstance
}

const createPlayingNotes = (args: { state: NotesStateT }) => {
  const playingState = {
    afterMs: 0,
    gain: args.state.gain,
    pan: args.state.pan
  }

  // Simulate playing the notes
  if (args.state.staggerMs > 0) {
    console.log(`Playing notes ${args.state.notes.join(', ')} with ${args.state.staggerMs}ms stagger`)
    args.state.notes.forEach((note, index) => {
      const delay = args.state.afterMs + (index * args.state.staggerMs)
      console.log(`  ${note} after ${delay}ms with velocity ${args.state.velocity}`)
    })
  } else {
    console.log(`Playing notes ${args.state.notes.join(', ')} simultaneously`)
    console.log(`  Velocity: ${args.state.velocity}`)
    if (args.state.afterMs > 0) {
      console.log(`  After: ${args.state.afterMs}ms`)
    }
  }

  if (args.state.durationMs) {
    console.log(`  Duration: ${args.state.durationMs}ms`)
  }

  const playingNotes: PlayingNotesT = {
    after: (ms: number) => {
      playingState.afterMs = ms
      return playingNotes
    },

    gain: (gain: number) => {
      playingState.gain = gain
      return playingNotes
    },

    pan: (pan: number) => {
      playingState.pan = pan
      return playingNotes
    },

    stop: () => {
      if (playingState.afterMs > 0) {
        console.log(`Stopping notes ${args.state.notes.join(', ')} after ${playingState.afterMs}ms`)
        console.log(`  Transitioning to gain: ${playingState.gain}, pan: ${playingState.pan}`)
      } else {
        console.log(`Stopping notes ${args.state.notes.join(', ')} immediately`)
      }
    }
  }

  return playingNotes
}