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
	stopAllNotes: () => void
}

export type AudioVoiceT = {
	id: string
	midi: number
	source: Tone.Player | null
	gainNode: Tone.Gain | null
	panNode: Tone.Panner | null
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

		// Initialize Tone.js - always use real audio context
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
			await getAudioContext() // Ensure audio context is ready

			// For Wembley, we use Tone.js synthesis instead of loading actual soundfont files
			// This provides immediate playback without network loading delays
			// Create placeholder entries for MIDI range (C3-C6)
			for (let midi = 48; midi <= 84; midi++) {
				soundfont.samples.set(midi, null) // Will be synthesized on-demand
			}

			soundfont.isLoaded = true
			console.log(`✓ Loaded Tone.js soundfont: ${soundfont.name}`)
		} catch (error) {
			console.error(`Failed to initialize soundfont ${soundfont.name}:`, error)
			throw error // Don't silently fail - let the user know something went wrong
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
					promise.then((actualVoice) => actualVoice.stop(stopArgs)).catch(console.error)
				},
				modulate: (modArgs) => {
					promise.then((actualVoice) => actualVoice.modulate(modArgs)).catch(console.error)
				}
			}

			// Update the voice once the audio is actually playing
			promise
				.then((actualVoice) => {
					voice.source = actualVoice.source
					voice.gainNode = actualVoice.gainNode
					voice.panNode = actualVoice.panNode
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
			activeVoices.forEach(voice => {
				voice.stop()
			})
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

	// Create Tone.js synth for this note  
	const frequency = midiToFrequency(args.midi)

	// Create a simple synth using Tone.js with validated envelope parameters
	const validateEnvelopeParam = (value: number | undefined, defaultValue: number, minValue: number): number => {
		if (value === undefined || value === null || isNaN(value)) return defaultValue
		return Math.max(value / 1000, minValue) // Convert ms to seconds with minimum
	}

	const synth = new Tone.Synth({
		oscillator: {
			type: 'sawtooth'
		},
		envelope: {
			attack: validateEnvelopeParam(args.attack, 0.01, 0.001), // Default 10ms, min 1ms
			decay: 0.3,
			sustain: 0.6,
			release: validateEnvelopeParam(args.release, 0.1, 0.01) // Default 100ms, min 10ms
		}
	})

	// Create gain and panner nodes with validated parameters
	const validateGain = (velocity: number, gainValue: number | undefined, configGain: number | undefined): number => {
		const safeVelocity = Math.max(0, Math.min(100, velocity || 70))
		const safeGain = Math.max(0, Math.min(100, gainValue || configGain || 70))
		return (safeVelocity / 100) * (safeGain / 100)
	}

	const validatePan = (panValue: number | undefined): number => {
		if (panValue === undefined || panValue === null || isNaN(panValue)) return 0
		return Math.max(-1, Math.min(1, panValue / 100))
	}

	const gainNode = new Tone.Gain(validateGain(args.velocity, args.gain, args.config.gain))
	const panNode = new Tone.Panner(validatePan(args.pan))

	// Chain: synth -> gain -> pan -> master
	synth.connect(gainNode)
	gainNode.connect(panNode)
	panNode.connect(audioCtx.masterGain)

	// Apply detune if specified
	if (args.detune) {
		try {
			synth.detune.value = args.detune
		} catch (error) {
			console.warn('Unable to set detune:', error)
		}
	}

	// Schedule playback with robust time calculation
	const calculateStartTime = (startTime?: number): string | number => {
		if (startTime === undefined || startTime === null) return Tone.now()
		
		// startTime should be relative time in seconds (e.g., 0.5 for 500ms delay)
		// For delayed playback, add to current audio context time
		if (startTime <= 0) return Tone.now()
		
		// Return absolute time for scheduled playback
		return Tone.now() + startTime
	}

	const startTime = calculateStartTime(args.startTime)
	
	// Validate duration parameter to prevent envelope issues
	if (args.duration && args.duration > 0) {
		const durationInSeconds = Math.max(args.duration / 1000, 0.01) // Minimum 10ms
		try {
			synth.triggerAttackRelease(frequency, durationInSeconds, startTime)
		} catch (error) {
			console.error('Error in triggerAttackRelease:', error)
			// Fallback to immediate play with simplified timing
			try {
				synth.triggerAttackRelease(frequency, durationInSeconds, Tone.now())
			} catch (fallbackError) {
				console.error('Fallback also failed:', fallbackError)
			}
		}
	} else {
		try {
			synth.triggerAttack(frequency, startTime)
		} catch (error) {
			console.error('Error in triggerAttack:', error)
			// Fallback to immediate play
			try {
				synth.triggerAttack(frequency, Tone.now())
			} catch (fallbackError) {
				console.error('Fallback also failed:', fallbackError)
			}
		}
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
					if (!args.duration) {
						// Only manually stop if not auto-stopping
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
			const duration = Math.max((modArgs.duration || 0) / 1000, 0)

			if (modArgs.gain !== undefined && !isNaN(modArgs.gain)) {
				const targetGain = validateGain(args.velocity, modArgs.gain, args.config.gain)
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

			if (modArgs.pan !== undefined && !isNaN(modArgs.pan)) {
				const targetPan = validatePan(modArgs.pan)
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
