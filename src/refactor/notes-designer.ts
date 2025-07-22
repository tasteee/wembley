import { Frequency } from 'tone'
import type { NoteInstanceT } from '../types.js'

type NotesDesignerArgsT = {
	notes: (string | number)[]
	instrument: any
}

type NotesDesignerSettingsT = {
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
	stagger?: number
}

export class NotesDesigner {
	notes = [] as (string | number)[]
	instrument = null as any
	settings = {} as NotesDesignerSettingsT

	shouldUseVelocityRange = false

	constructor(args: NotesDesignerArgsT) {
		this.notes = args.notes
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

	stagger = (milliseconds: number) => {
		this.settings.stagger = milliseconds
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

	play = (): NoteInstanceT[] => {
		if (!this.instrument || !this.instrument.synth) {
			throw new Error('Instrument not properly initialized')
		}

		const noteInstances: NoteInstanceT[] = []
		const staggerDelay = this.settings.stagger || 0

		this.notes.forEach((note, index) => {
			// Convert note to MIDI if it's a string
			const midi = typeof note === 'string' 
				? Frequency(note).toMidi() 
				: note

			// Calculate velocity
			const velocity = this.shouldUseVelocityRange
				? this.calculateVelocityFromRange()
				: this.settings.velocity || this.instrument.settings.velocity || 75

			// Calculate start time with stagger
			const startTime = (this.settings.after || 0) + (index * staggerDelay)

			// Play the note using the instrument's synth
			const voice = this.instrument.synth.playNote({
				midi,
				velocity,
				startTime,
				duration: this.settings.duration,
				detune: this.settings.detune,
				attack: this.settings.attack,
				release: this.settings.release,
				gain: this.settings.gain,
				pan: this.settings.pan
			})

			// Create note instance
			const noteInstance: NoteInstanceT = {
				id: voice.id,
				name: typeof note === 'string' ? note : Frequency(note, 'midi').toNote(),
				settings: {
					velocity,
					pan: this.settings.pan || this.instrument.settings.pan || 0,
					attack: this.settings.attack || 0,
					release: this.settings.release || 0,
					detune: this.settings.detune || 0,
					duration: this.settings.duration || 0,
					after: startTime,
					midi
				},
				play: () => {
					// Re-trigger the same note
					return this.instrument.note(note).play()
				},
				stop: () => {
					voice.stop()
				},
				after: (milliseconds: number) => {
					setTimeout(() => voice.stop(), milliseconds)
					return noteInstance
				},
				duration: (milliseconds: number) => {
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

			noteInstances.push(noteInstance)
		})

		return noteInstances
	}

	stop = (note?: string) => {
		if (note) {
			this.instrument.stop(note)
		} else {
			// Stop all notes in this collection
			this.notes.forEach(n => this.instrument.stop(n))
		}
	}

	private calculateVelocityFromRange = (): number => {
		const min = this.settings.minVelocity || this.instrument.settings.minVelocity || 60
		const max = this.settings.maxVelocity || this.instrument.settings.maxVelocity || 80
		return Math.random() * (max - min) + min
	}
}