import { Frequency } from 'tone'
import type { NoteInstanceT } from '../types.js'

type NoteDesignerArgsT = {
	note: string | number
	instrument: any
}

type NoteDesignerSettingsT = {
	after?: number
	duration?: number
	velocity?: number
	minVelocity?: number
	maxVelocity?: number
	detune?: number
	attack?: number
	release?: number
	gain?: number
	pan?: number
}

export class NoteDesigner {
	note = '' as string | number
	instrument = null as any
	settings = {} as NoteDesignerSettingsT

	shouldUseVelocityRange = false

	constructor(args: NoteDesignerArgsT) {
		this.note = args.note
		this.instrument = args.instrument
	}

	after = (milliseconds: number) => {
		this.settings.after = milliseconds
		return this
	}

	velocity = (velocity: number, maxVelocity?: number) => {
		if (maxVelocity !== undefined) {
			// If two parameters are provided, treat first as min, second as max
			this.settings.minVelocity = velocity
			this.settings.maxVelocity = maxVelocity
			this.shouldUseVelocityRange = true
		} else {
			// Single parameter sets fixed velocity
			this.settings.velocity = velocity
			this.shouldUseVelocityRange = false
		}
		return this
	}

	duration = (milliseconds: number) => {
		this.settings.duration = milliseconds
		return this
	}

	minVelocity = (minVelocity: number) => {
		this.settings.minVelocity = minVelocity
		this.shouldUseVelocityRange = true
		return this
	}

	maxVelocity = (maxVelocity: number) => {
		this.settings.maxVelocity = maxVelocity
		this.shouldUseVelocityRange = true
		return this
	}

	detune = (cents: number) => {
		this.settings.detune = cents
		return this
	}

	attack = (milliseconds: number) => {
		this.settings.attack = milliseconds
		return this
	}

	release = (milliseconds: number) => {
		this.settings.release = milliseconds
		return this
	}

	gain = (gain: number) => {
		this.settings.gain = gain
		return this
	}

	pan = (pan: number) => {
		this.settings.pan = pan
		return this
	}

	play = (): NoteInstanceT => {
		if (!this.instrument || !this.instrument.synth) {
			throw new Error('Instrument not properly initialized')
		}

		// Convert note to MIDI if it's a string
		const midi = typeof this.note === 'string' 
			? Frequency(this.note).toMidi() 
			: this.note

		// Calculate velocity
		const velocity = this.shouldUseVelocityRange
			? this.calculateVelocityFromRange()
			: this.settings.velocity || this.instrument.settings.velocity || 75

		// Play the note using the instrument's synth
		const voice = this.instrument.synth.playNote({
			midi,
			velocity,
			startTime: this.settings.after,
			duration: this.settings.duration,
			detune: this.settings.detune,
			attack: this.settings.attack,
			release: this.settings.release,
			gain: this.settings.gain,
			pan: this.settings.pan
		})

		// Create and return a note instance
		const noteInstance: NoteInstanceT = {
			id: voice.id,
			name: typeof this.note === 'string' ? this.note : Frequency(this.note, 'midi').toNote(),
			settings: {
				velocity,
				pan: this.settings.pan || this.instrument.settings.pan || 0,
				attack: this.settings.attack || 0,
				release: this.settings.release || 0,
				detune: this.settings.detune || 0,
				duration: this.settings.duration || 0,
				after: this.settings.after || 0,
				midi
			},
			play: () => {
				// Re-trigger the same note
				return this.play()
			},
			stop: () => {
				voice.stop()
			},
			after: (milliseconds: number) => {
				// For chaining stop commands - schedule the stop and return the same instance
				setTimeout(() => voice.stop(), milliseconds)
				return noteInstance
			},
			duration: (milliseconds: number) => {
				// This doesn't make sense for stop, but keeping API consistent
				return noteInstance
			},
			gain: (gain: number) => {
				voice.modulate({ gain })
				return noteInstance
			},
			pan: (pan: number) => {
				voice.modulate({ pan })
				return noteInstance
			}
		}

		return noteInstance
	}

	stop = () => {
		// This stops all instances of this note from this instrument
		// TODO: Implement selective stopping
		this.instrument.stop(this.note)
	}

	private calculateVelocityFromRange = (): number => {
		const min = this.settings.minVelocity || this.instrument.settings.minVelocity || 60
		const max = this.settings.maxVelocity || this.instrument.settings.maxVelocity || 80
		return Math.random() * (max - min) + min
	}
}
