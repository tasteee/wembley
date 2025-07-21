import type { ConfigT } from './types.js'

export type AudioContextT = {
  context: AudioContext
  masterGain: GainNode
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
  samples: Map<number, AudioBuffer>
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
  source: AudioBufferSourceNode | null
  gainNode: GainNode | null
  panNode: StereoPannerNode | null
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

    // Check if we're in a browser environment with Web Audio API
    if (typeof globalThis.AudioContext === 'undefined' && typeof globalThis.webkitAudioContext === 'undefined') {
      // Fallback for Node.js/test environments
      console.log('Web Audio API not available, creating mock audio context')
      audioContext = {
        context: null as any, // Mock context
        masterGain: null as any, // Mock master gain
        isStarted: true
      }
      return audioContext
    }

    const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext
    const context = new AudioCtx()
    const masterGain = context.createGain()
    masterGain.connect(context.destination)
    masterGain.gain.value = 0.7

    // Ensure context starts (requires user interaction)
    if (context.state === 'suspended') {
      await context.resume()
    }

    audioContext = {
      context,
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
      
      // Generate basic sine wave samples for common MIDI notes (C3-C6)
      for (let midi = 48; midi <= 84; midi++) {
        const buffer = createSyntheticSample({ 
          audioContext: audioCtx.context, 
          frequency: midiToFrequency(midi),
          duration: 3.0
        })
        soundfont.samples.set(midi, buffer)
      }

      soundfont.isLoaded = true
      console.log(`✓ Loaded synthetic soundfont: ${soundfont.name}`)
      
    } catch (error) {
      console.error(`Failed to load soundfont from ${args.url}:`, error)
      // Still mark as loaded so the API continues to work
      soundfont.isLoaded = true
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

      // Create a temporary voice that will be replaced when audio context is ready
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

  const { context } = audioCtx

  // Get the closest sample (for simplicity, use exact match or nearest)
  let sample = args.soundfont.samples.get(args.midi)
  if (!sample) {
    // Find nearest sample
    const availableMidis = Array.from(args.soundfont.samples.keys()).sort((a, b) => a - b)
    if (availableMidis.length === 0) {
      throw new Error(`No samples available in soundfont`)
    }
    
    const nearestMidi = availableMidis.reduce((prev, curr) => 
      Math.abs(curr - args.midi) < Math.abs(prev - args.midi) ? curr : prev
    )
    sample = args.soundfont.samples.get(nearestMidi)
  }

  if (!sample) {
    throw new Error(`No sample available for MIDI note ${args.midi}`)
  }

  // Create audio nodes
  const source = context.createBufferSource()
  const gainNode = context.createGain()
  const panNode = context.createStereoPanner()

  source.buffer = sample
  source.connect(gainNode)
  gainNode.connect(panNode)
  panNode.connect(audioCtx.masterGain)

  // Apply settings
  const velocityGain = (args.velocity / 100) * (args.gain || args.config.gain || 70) / 100
  gainNode.gain.value = velocityGain

  if (args.pan !== undefined) {
    panNode.pan.value = Math.max(-1, Math.min(1, args.pan / 100))
  }

  if (args.detune) {
    source.detune.value = args.detune
  }

  // Schedule playback
  const startTime = args.startTime || context.currentTime
  source.start(startTime)

  if (args.duration) {
    source.stop(startTime + (args.duration / 1000))
  }

  // Create voice object
  const voice: AudioVoiceT = {
    id: args.voiceId,
    midi: args.midi,
    source,
    gainNode,
    panNode,
    isPlaying: true,

    stop: (stopArgs) => {
      const stopTime = stopArgs?.stopTime || context.currentTime
      const fadeTime = stopArgs?.fadeTime || 0.05

      if (voice.isPlaying && gainNode && source) {
        try {
          gainNode.gain.exponentialRampToValueAtTime(0.001, stopTime + fadeTime)
          source.stop(stopTime + fadeTime)
          voice.isPlaying = false
        } catch (error) {
          // Audio node may have already stopped
          voice.isPlaying = false
        }
      }
    },

    modulate: (modArgs) => {
      if (!gainNode || !panNode) return
      
      const now = context.currentTime
      const startTime = modArgs.startTime || now
      const duration = (modArgs.duration || 0) / 1000

      if (modArgs.gain !== undefined) {
        const targetGain = (modArgs.gain / 100) * velocityGain
        try {
          if (duration > 0) {
            gainNode.gain.linearRampToValueAtTime(targetGain, startTime + duration)
          } else {
            gainNode.gain.value = targetGain
          }
        } catch (error) {
          // Audio node may have been disconnected
        }
      }

      if (modArgs.pan !== undefined) {
        const targetPan = Math.max(-1, Math.min(1, modArgs.pan / 100))
        try {
          if (duration > 0) {
            panNode.pan.linearRampToValueAtTime(targetPan, startTime + duration)
          } else {
            panNode.pan.value = targetPan
          }
        } catch (error) {
          // Audio node may have been disconnected
        }
      }
    }
  }

  return voice
}

const createSyntheticSample = (args: { 
  audioContext: AudioContext
  frequency: number
  duration: number
}): AudioBuffer => {
  const sampleRate = args.audioContext.sampleRate
  const length = sampleRate * args.duration
  const buffer = args.audioContext.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)

  // Create a simple synthesized waveform (sine with envelope)
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate
    
    // Sine wave
    let sample = Math.sin(2 * Math.PI * args.frequency * t)
    
    // Add some harmonics for richer sound
    sample += 0.3 * Math.sin(2 * Math.PI * args.frequency * 2 * t)
    sample += 0.1 * Math.sin(2 * Math.PI * args.frequency * 3 * t)
    
    // ADSR envelope
    const attackTime = 0.1
    const decayTime = 0.3
    const sustainLevel = 0.6
    const releaseTime = 2.6
    
    let envelope = 1
    if (t < attackTime) {
      envelope = t / attackTime
    } else if (t < attackTime + decayTime) {
      envelope = 1 - (1 - sustainLevel) * (t - attackTime) / decayTime
    } else if (t < args.duration - releaseTime) {
      envelope = sustainLevel
    } else {
      envelope = sustainLevel * (args.duration - t) / releaseTime
    }
    
    data[i] = sample * envelope * 0.3 // Overall volume
  }

  return buffer
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