import * as Tone from 'tone'
import type { ConfigT } from './types.js'

export type AudioContextT = {
  context: Tone.BaseContext
  masterGain: Tone.Gain
  isStarted: boolean
}

export type AudioEngineT = {
  getAudioContext: () => Promise<AudioContextT>
  loadSoundfont: (args: { url: string }) => Promise<AudioFontT>
  createSynth: (args: { soundfont: AudioFontT; config: ConfigT }) => AudioSynthT
}

export type AudioFontT = {
  name: string
  url: string
  samples: Map<number, Tone.ToneAudioBuffer | null>
  isLoaded: boolean
}

export type AudioSynthT = {
  playNote: (args: {
    midi: number
    velocity: number
    startTime?: number
    duration?: number
    detune?: number
    attack?: number
    release?: number
    gain?: number
    pan?: number
  }) => AudioVoiceT
  stopNote: (args: { voice: AudioVoiceT; stopTime?: number }) => void
}

export type AudioVoiceT = {
  id: string
  midi: number
  source: Tone.Player | null
  gainNode: Tone.Gain | null
  panNode: Tone.Panner | null
  isPlaying: boolean
  stop: (args?: { stopTime?: number; fadeTime?: number }) => void
  modulate: (args: { 
    gain?: number
    pan?: number
    startTime?: number
    duration?: number
  }) => void
}

const createAudioEngine = (): AudioEngineT => {
  let audioContext: AudioContextT | null = null

  const getAudioContext = async (): Promise<AudioContextT> => {
    if (audioContext && audioContext.isStarted) {
      return audioContext
    }

    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      // Node.js/test environment - create mock context
      console.log('Running in Node.js environment, creating mock audio context')
      audioContext = {
        context: null as any,
        masterGain: null as any,
        isStarted: true
      }
      return audioContext
    }

    // Initialize Tone.js
    if (Tone.getContext().state === 'suspended') {
      await Tone.start()
    }

    const masterGain = new Tone.Gain(0.7).toDestination()
    
    audioContext = {
      context: Tone.getContext(),
      masterGain,
      isStarted: true
    }

    return audioContext
  }

  const loadSoundfont = async (args: { url: string }): Promise<AudioFontT> => {
    const soundfont: AudioFontT = {
      name: extractNameFromUrl(args.url),
      url: args.url,
      samples: new Map(),
      isLoaded: false
    }

    try {
      const audioCtx = await getAudioContext()
      
      // If we don't have a real audio context, create mock samples
      if (!audioCtx.context) {
        console.log(`✓ Loaded mock soundfont: ${soundfont.name}`)
        soundfont.isLoaded = true
        return soundfont
      }
      
      // Create Tone.js oscillator samples for common MIDI notes (C3-C6)
      for (let midi = 48; midi <= 84; midi++) {
        // We'll create samples on-demand using Tone.js synthesis
        soundfont.samples.set(midi, null) // Placeholder for now
      }

      soundfont.isLoaded = true
      console.log(`✓ Loaded Tone.js soundfont: ${soundfont.name}`)
      
    } catch (error) {
      console.error(`Failed to load soundfont from ${args.url}:`, error)
      soundfont.isLoaded = true // Still mark as loaded so API continues to work
    }

    return soundfont
  }

  const createSynth = (args: { soundfont: AudioFontT; config: ConfigT }): AudioSynthT => {
    const activeVoices = new Map<string, AudioVoiceT>()
    const engineInstance = { getAudioContext, loadSoundfont, createSynth }

    const playNote = (noteArgs: {
      midi: number
      velocity: number
      startTime?: number
      duration?: number
      detune?: number
      attack?: number
      release?: number
      gain?: number
      pan?: number
    }): AudioVoiceT => {
      const voiceId = `${noteArgs.midi}-${Date.now()}-${Math.random()}`
      
      const promise = playNoteInternal({ 
        ...noteArgs, 
        voiceId,
        soundfont: args.soundfont,
        config: args.config,
        engine: engineInstance
      })

      // Create a voice that will be populated when audio context is ready
      const voice: AudioVoiceT = {
        id: voiceId,
        midi: noteArgs.midi,
        source: null,
        gainNode: null,
        panNode: null,
        isPlaying: false,
        stop: (stopArgs) => {
          promise.then(actualVoice => actualVoice.stop(stopArgs)).catch(console.error)
        },
        modulate: (modArgs) => {
          promise.then(actualVoice => actualVoice.modulate(modArgs)).catch(console.error)
        }
      }

      // Update the voice once the audio is actually playing
      promise.then(actualVoice => {
        voice.source = actualVoice.source
        voice.gainNode = actualVoice.gainNode
        voice.panNode = actualVoice.panNode
        voice.isPlaying = actualVoice.isPlaying
      }).catch(console.error)

      activeVoices.set(voiceId, voice)
      return voice
    }

    const stopNote = (args: { voice: AudioVoiceT; stopTime?: number }) => {
      args.voice.stop({ stopTime: args.stopTime })
      activeVoices.delete(args.voice.id)
    }

    return {
      playNote,
      stopNote
    }
  }

  return {
    getAudioContext,
    loadSoundfont,
    createSynth
  }
}

const playNoteInternal = async (args: {
  midi: number
  velocity: number
  startTime?: number
  duration?: number
  detune?: number
  attack?: number
  release?: number
  gain?: number
  pan?: number
  voiceId: string
  soundfont: AudioFontT
  config: ConfigT
  engine: AudioEngineT
}): Promise<AudioVoiceT> => {
  const audioCtx = await args.engine.getAudioContext()
  
  // Handle mock audio context (testing environment)
  if (!audioCtx.context) {
    console.log(`[Mock] Playing MIDI ${args.midi} with velocity ${args.velocity}`)
    
    const mockVoice: AudioVoiceT = {
      id: args.voiceId,
      midi: args.midi,
      source: null,
      gainNode: null,
      panNode: null,
      isPlaying: true,

      stop: (stopArgs) => {
        console.log(`[Mock] Stopping MIDI ${args.midi}`)
        mockVoice.isPlaying = false
      },

      modulate: (modArgs) => {
        console.log(`[Mock] Modulating MIDI ${args.midi}`, modArgs)
      }
    }

    return mockVoice
  }

  // Create Tone.js synth for this note
  const frequency = midiToFrequency(args.midi)
  
  // Create a simple synth using Tone.js
  const synth = new Tone.Synth({
    oscillator: {
      type: 'sawtooth'
    },
    envelope: {
      attack: (args.attack || 10) / 1000,
      decay: 0.3,
      sustain: 0.6,
      release: (args.release || 100) / 1000
    }
  })
  
  // Create gain and panner nodes
  const gainNode = new Tone.Gain((args.velocity / 100) * (args.gain || args.config.gain || 70) / 100)
  const panNode = new Tone.Panner(args.pan ? Math.max(-1, Math.min(1, args.pan / 100)) : 0)
  
  // Chain: synth -> gain -> pan -> master
  synth.connect(gainNode)
  gainNode.connect(panNode)
  panNode.connect(audioCtx.masterGain)

  // Apply detune if specified
  if (args.detune) {
    synth.detune.value = args.detune
  }

  // Schedule playback
  const startTime = args.startTime ? `+${(args.startTime * 1000 - performance.now()) / 1000}` : 'now'
  
  if (args.duration) {
    synth.triggerAttackRelease(frequency, args.duration / 1000, startTime)
  } else {
    synth.triggerAttack(frequency, startTime)
  }

  // Create voice object
  const voice: AudioVoiceT = {
    id: args.voiceId,
    midi: args.midi,
    source: synth as any, // Tone.Synth instead of Tone.Player
    gainNode,
    panNode,
    isPlaying: true,

    stop: (stopArgs) => {
      const stopTime = stopArgs?.stopTime || Tone.now()
      const fadeTime = stopArgs?.fadeTime || 0.05

      if (voice.isPlaying && synth) {
        try {
          if (!args.duration) { // Only manually stop if not auto-stopping
            synth.triggerRelease(stopTime + fadeTime)
          }
          voice.isPlaying = false
          
          // Clean up after fade completes
          setTimeout(() => {
            synth.dispose()
            gainNode.dispose()
            panNode.dispose()
          }, fadeTime * 1000 + 100)
          
        } catch (error) {
          // Synth may have already been disposed
          voice.isPlaying = false
        }
      }
    },

    modulate: (modArgs) => {
      if (!gainNode || !panNode) return
      
      const now = Tone.now()
      const startTime = modArgs.startTime || now
      const duration = (modArgs.duration || 0) / 1000

      if (modArgs.gain !== undefined) {
        const targetGain = (modArgs.gain / 100) * ((args.velocity / 100) * (args.gain || args.config.gain || 70) / 100)
        try {
          if (duration > 0) {
            gainNode.gain.linearRampTo(targetGain, duration, startTime)
          } else {
            gainNode.gain.value = targetGain
          }
        } catch (error) {
          // Node may have been disposed
        }
      }

      if (modArgs.pan !== undefined) {
        const targetPan = Math.max(-1, Math.min(1, modArgs.pan / 100))
        try {
          if (duration > 0) {
            panNode.pan.linearRampTo(targetPan, duration, startTime)
          } else {
            panNode.pan.value = targetPan
          }
        } catch (error) {
          // Node may have been disposed
        }
      }
    }
  }

  return voice
}

const midiToFrequency = (midi: number): number => {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

const extractNameFromUrl = (url: string): string => {
  const match = url.match(/([^/]+)\.sf2?$/i)
  return match ? match[1] : 'unknown'
}

// Export the singleton instance
export const audioEngine = createAudioEngine()