import * as Tone from 'tone'
import type { ConfigT } from './types.js'

// Import soundfont-player for actual soundfont loading
// @ts-ignore - no type definitions available
import Soundfont from 'soundfont-player'

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
  soundfontPlayer: any // The soundfont-player instrument instance
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
  stopAllNotes: () => void
}

export type AudioVoiceT = {
  id: string
  midi: number
  soundfontNote: any // The playing note from soundfont-player
  isPlaying: boolean
  stop: (args?: { stopTime?: number; fadeTime?: number }) => void
  modulate: (args: { gain?: number; pan?: number; startTime?: number; duration?: number }) => void
}

const createAudioEngine = (): AudioEngineT => {
  let audioContext: AudioContextT | null = null

  const getAudioContext = async (): Promise<AudioContextT> => {
    if (audioContext && audioContext.isStarted) {
      return audioContext
    }

    // For soundfont integration, we need a native AudioContext
    let nativeContext: AudioContext
    
    try {
      nativeContext = new AudioContext()
      if (nativeContext.state === 'suspended') {
        await nativeContext.resume()
      }
    } catch (error) {
      // Fallback to Tone.js context for environments where AudioContext isn't available
      if (Tone.getContext().state === 'suspended') {
        await Tone.start()
      }
      nativeContext = Tone.getContext().rawContext as AudioContext || Tone.getContext() as any
    }

    // Create a simple gain node for master volume
    const masterGain = nativeContext.createGain ? 
      nativeContext.createGain() : 
      new Tone.Gain(0.7).toDestination()
    
    if (nativeContext.createGain) {
      masterGain.connect(nativeContext.destination)
      masterGain.gain.value = 0.7
    }

    audioContext = {
      context: nativeContext as any,
      masterGain: masterGain as any,
      isStarted: true
    }

    return audioContext
  }

  const loadSoundfont = async (args: { url: string }): Promise<AudioFontT> => {
    const soundfont: AudioFontT = {
      name: extractNameFromUrl(args.url),
      url: args.url,
      soundfontPlayer: null,
      isLoaded: false
    }

    try {
      const audioCtx = await getAudioContext()
      
      console.log(`Loading soundfont from ${args.url}...`)
      
      // Determine how to load the soundfont based on URL
      let instrumentName: string
      let loadOptions: any = {}
      
      if (args.url.endsWith('.sf2')) {
        // For .sf2 files, we need to inform the user that direct SF2 loading isn't supported
        // For now, we'll fall back to a default instrument
        console.warn(`Direct .sf2 file loading is not yet supported. Using default instrument for ${soundfont.name}`)
        instrumentName = 'acoustic_grand_piano' // Default fallback
      } else {
        // Assume it's a path to a pre-converted soundfont or an instrument name
        if (args.url.includes('/') || args.url.includes('.js')) {
          // It's a custom path
          instrumentName = args.url
        } else {
          // It's an instrument name
          instrumentName = args.url
        }
      }

      // Load the soundfont using soundfont-player
      const player = await Soundfont.instrument(audioCtx.context as any, instrumentName as any, {
        ...loadOptions
        // Don't connect to Tone.js destination - let soundfont-player handle its own routing
      })

      soundfont.soundfontPlayer = player
      soundfont.isLoaded = true
      
      console.log(`✓ Loaded soundfont: ${soundfont.name}`)
    } catch (error) {
      console.error(`Failed to load soundfont ${soundfont.name}:`, error)
      throw error
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
        soundfontNote: null,
        isPlaying: false,
        stop: (stopArgs) => {
          promise.then((actualVoice) => actualVoice.stop(stopArgs)).catch(console.error)
        },
        modulate: (modArgs) => {
          promise.then((actualVoice) => actualVoice.modulate(modArgs)).catch(console.error)
        }
      }

      // Update the voice once the audio is actually playing
      promise
        .then((actualVoice) => {
          voice.soundfontNote = actualVoice.soundfontNote
          voice.isPlaying = actualVoice.isPlaying
        })
        .catch(console.error)

      activeVoices.set(voiceId, voice)
      return voice
    }

    const stopNote = (args: { voice: AudioVoiceT; stopTime?: number }) => {
      args.voice.stop({ stopTime: args.stopTime })
      activeVoices.delete(args.voice.id)
    }

    const stopAllNotes = () => {
      console.log(`Stopping all notes for synth (${activeVoices.size} active voices)`)
      activeVoices.forEach(voice => voice.stop())
      activeVoices.clear()
    }

    return {
      playNote,
      stopNote,
      stopAllNotes
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

  if (!args.soundfont.soundfontPlayer || !args.soundfont.isLoaded) {
    throw new Error('Soundfont not loaded')
  }

  // Calculate timing
  const startTime = args.startTime ? audioCtx.context.currentTime + (args.startTime / 1000) : audioCtx.context.currentTime
  const duration = args.duration ? args.duration / 1000 : undefined
  
  // Calculate gain based on velocity and configuration
  const velocityGain = Math.max(0, Math.min(100, args.velocity || 70)) / 100
  const configGain = Math.max(0, Math.min(100, args.config.gain || 70)) / 100
  const finalGain = velocityGain * configGain * (args.gain ? (args.gain / 100) : 1)

  // Prepare soundfont-player options
  const playOptions: any = {
    time: startTime,
    gain: finalGain
  }

  if (duration) {
    playOptions.duration = duration
  }

  // Play the note using soundfont-player
  const soundfontNote = args.soundfont.soundfontPlayer.play(args.midi, startTime, playOptions)

  // Create voice object
  const voice: AudioVoiceT = {
    id: args.voiceId,
    midi: args.midi,
    soundfontNote: soundfontNote,
    isPlaying: true,

    stop: (stopArgs) => {
      if (voice.isPlaying && soundfontNote) {
        try {
          const stopTime = stopArgs?.stopTime || audioCtx.context.currentTime
          if (soundfontNote.stop) {
            soundfontNote.stop(stopTime)
          }
          voice.isPlaying = false
        } catch (error) {
          console.warn('Error stopping soundfont note:', error)
          voice.isPlaying = false
        }
      }
    },

    modulate: (modArgs) => {
      // Soundfont-player doesn't support real-time modulation
      // This is a limitation we'll document
      console.warn('Real-time modulation is not supported with soundfont playback')
    }
  }

  return voice
}

const extractNameFromUrl = (url: string): string => {
  const match = url.match(/([^/]+)\.sf2?$/i)
  return match ? match[1] : 'unknown'
}

// Export the singleton instance
export const audioEngine = createAudioEngine()
