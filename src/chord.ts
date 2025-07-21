import type { ChordT, PlayingNotesT, ConfigT, VoicingT, InstanceTrackerT } from './types.js'
import type { AudioSynthT, AudioVoiceT } from './audio-engine.js'
import { getChordNotes, applyInversion } from './utils/chord-parser.js'
import { applyVoicing } from './voicings.js'
import { noteToMidi } from './utils/note-parser.js'

type ChordStateT = {
  chord: string
  notes: string[]
  velocity: number
  minVelocity?: number
  maxVelocity?: number
  afterMs: number
  durationMs?: number
  staggerMs: number
  octave: number
  inversion: number
  voicing?: VoicingT | string
  bassNote?: string | number
  detuneCents: number
  attackMs?: number
  releaseMs?: number
  gain: number
  pan: number
}

export const createChord = (args: { chord: string; synth: AudioSynthT; config: ConfigT; instanceTracker: InstanceTrackerT }) => {
  const initialNotes = getChordNotes({ chord: args.chord, octave: 4 })
  
  const state: ChordStateT = {
    chord: args.chord,
    notes: initialNotes,
    velocity: args.config.minVelocity || 45,
    afterMs: 0,
    staggerMs: 0,
    octave: 4,
    inversion: 0,
    detuneCents: 0,
    gain: args.config.gain || 70,
    pan: 0
  }

  const updateNotes = () => {
    let notes = getChordNotes({ chord: state.chord, octave: state.octave })
    
    if (state.inversion > 0) {
      notes = applyInversion({ notes, inversion: state.inversion })
    }

    console.log('updateNotes()', { notes, state })
    
    if (state.voicing) {
      if (typeof state.voicing === 'string' && state.voicing in (args.config.voicings || {})) {
        // Custom voicing from config
        const customVoicing = args.config.voicings![state.voicing]
        notes = customVoicing(notes)
      } else {
        // Built-in voicing
        notes = applyVoicing({ notes, voicing: state.voicing as VoicingT })
      }
    }
    
    if (state.bassNote !== undefined) {
      if (typeof state.bassNote === 'string') {
        // Replace bass with specific note - ensure it has an octave
        let bassNote = state.bassNote
        if (!/\d/.test(bassNote)) {
          // Add default octave if none specified
          bassNote = `${bassNote}${state.octave}`
        }
        notes[0] = bassNote
      } else {
        // Use indexed note as bass
        const bassIndex = state.bassNote % notes.length
        const bassNote = notes[bassIndex]
        notes = [bassNote, ...notes.filter((_, i) => i !== bassIndex)]
      }
    }
    
    state.notes = notes
  }

  const chordInstance: ChordT = {
    velocity: ((vel: number, maxVel?: number) => {
      if (maxVel !== undefined) {
        state.minVelocity = vel
        state.maxVelocity = maxVel
        state.velocity = Math.random() * (maxVel - vel) + vel
      } else {
        state.velocity = vel
      }
      return chordInstance
    }) as ChordT['velocity'],

    after: (ms: number) => {
      state.afterMs = ms
      return chordInstance
    },

    duration: (ms: number) => {
      state.durationMs = ms
      return chordInstance
    },

    stagger: (ms: number) => {
      state.staggerMs = ms
      return chordInstance
    },

    octave: (octave: number) => {
      state.octave = octave
      updateNotes()
      return chordInstance
    },

    inversion: (inversion: number) => {
      state.inversion = inversion
      updateNotes()
      return chordInstance
    },

    voicing: (voicing: VoicingT | string) => {
      state.voicing = voicing
      updateNotes()
      return chordInstance
    },

    bassNote: (note: string | number) => {
      state.bassNote = note
      updateNotes()
      return chordInstance
    },

    detune: (cents: number) => {
      state.detuneCents = cents
      return chordInstance
    },

    attack: (ms: number) => {
      state.attackMs = ms
      return chordInstance
    },

    release: (ms: number) => {
      state.releaseMs = ms
      return chordInstance
    },

    gain: (gain: number) => {
      state.gain = gain
      return chordInstance
    },

    pan: (pan: number) => {
      state.pan = pan
      return chordInstance
    },

    play: () => {
      return createPlayingChord({ state, synth: args.synth, instanceTracker: args.instanceTracker })
    },

    stop: () => {
      console.log(`Stopping chord ${state.chord} (${state.notes.join(', ')}) immediately`)
      const instances = args.instanceTracker.chordInstances.get(state.chord)
      if (instances) {
        instances.forEach(voice => voice.stop())
        instances.clear()
      }
    }
  }

  return chordInstance
}

const createPlayingChord = (args: { state: ChordStateT; synth: AudioSynthT; instanceTracker: InstanceTrackerT }) => {
  const playingState = {
    afterMs: 0,
    gain: args.state.gain,
    pan: args.state.pan
  }

  const voices: AudioVoiceT[] = []

  // Display chord info
  console.log(`Playing chord ${args.state.chord}`)
  console.log(`  Notes: ${args.state.notes.join(', ')}`)
  
  if (args.state.octave !== 4) {
    console.log(`  Octave: ${args.state.octave}`)
  }
  
  if (args.state.inversion > 0) {
    console.log(`  Inversion: ${args.state.inversion}`)
  }
  
  if (args.state.voicing) {
    console.log(`  Voicing: ${args.state.voicing}`)
  }
  
  if (args.state.bassNote !== undefined) {
    console.log(`  Bass note: ${args.state.bassNote}`)
  }

  // Play the chord using the audio synth
  if (args.state.staggerMs > 0) {
    console.log(`  Stagger: ${args.state.staggerMs}ms`)
    
    args.state.notes.forEach((note, index) => {
      const midi = noteToMidi({ note })
      const delay = args.state.afterMs + (index * args.state.staggerMs)
      const startTime = delay > 0 ? (performance.now() + delay) / 1000 : undefined
      
      console.log(`    ${note} (MIDI ${midi}) after ${delay}ms`)
      
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
      
      voices.push(voice)
    })
    
    // Track chord instances
    if (!args.instanceTracker.chordInstances.has(args.state.chord)) {
      args.instanceTracker.chordInstances.set(args.state.chord, new Set())
    }
    const chordInstances = args.instanceTracker.chordInstances.get(args.state.chord)!
    voices.forEach(voice => {
      chordInstances.add(voice)
      args.instanceTracker.allInstances.add(voice)
    })
  } else {
    console.log(`  Velocity: ${args.state.velocity}`)
    
    if (args.state.afterMs > 0) {
      console.log(`  After: ${args.state.afterMs}ms`)
    }

    const startTime = args.state.afterMs > 0 
      ? (performance.now() + args.state.afterMs) / 1000 
      : undefined

    args.state.notes.forEach(note => {
      const midi = noteToMidi({ note })
      
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
      
      voices.push(voice)
    })
    
    // Track chord instances
    if (!args.instanceTracker.chordInstances.has(args.state.chord)) {
      args.instanceTracker.chordInstances.set(args.state.chord, new Set())
    }
    const chordInstances = args.instanceTracker.chordInstances.get(args.state.chord)!
    voices.forEach(voice => {
      chordInstances.add(voice)
      args.instanceTracker.allInstances.add(voice)
    })
  }

  if (args.state.durationMs) {
    console.log(`  Duration: ${args.state.durationMs}ms`)
  }

  const playingChord: PlayingNotesT = {
    after: (ms: number) => {
      playingState.afterMs = ms
      return playingChord
    },

    gain: (gain: number) => {
      playingState.gain = gain
      return playingChord
    },

    pan: (pan: number) => {
      playingState.pan = pan
      return playingChord
    },

    stop: () => {
      if (playingState.afterMs > 0) {
        console.log(`Stopping chord ${args.state.chord} after ${playingState.afterMs}ms`)
        console.log(`  Transitioning to gain: ${playingState.gain}, pan: ${playingState.pan}`)
        
        // Apply modulations before stopping
        setTimeout(() => {
          voices.forEach(voice => {
            voice.modulate({
              gain: playingState.gain,
              pan: playingState.pan,
              duration: playingState.afterMs
            })
          })
          
          setTimeout(() => {
            voices.forEach(voice => voice.stop())
            // Clean up tracking
            const chordInstances = args.instanceTracker.chordInstances.get(args.state.chord)
            if (chordInstances) {
              voices.forEach(voice => chordInstances.delete(voice))
            }
            voices.forEach(voice => args.instanceTracker.allInstances.delete(voice))
          }, playingState.afterMs)
        }, 0)
      } else {
        console.log(`Stopping chord ${args.state.chord} immediately`)
        voices.forEach(voice => voice.stop())
        // Clean up tracking
        const chordInstances = args.instanceTracker.chordInstances.get(args.state.chord)
        if (chordInstances) {
          voices.forEach(voice => chordInstances.delete(voice))
        }
        voices.forEach(voice => args.instanceTracker.allInstances.delete(voice))
      }
    }
  }

  return playingChord
}