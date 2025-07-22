import { Chord } from 'tonal'
import { NotesDesigner } from './notes-designer.js'
import type { NoteInstanceT, VoicingT, VoicingFunctionT } from '../types.js'

type ChordDesignerArgsT = {
	chord: string
	instrument: any
}

type ChordDesignerSettingsT = {
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
	octave?: number
	inversion?: number
	voicing?: VoicingT | string
	bassNote?: string | number
	bassOctave?: number
}

export class ChordDesigner {
	chord = ''
	instrument = null as any
	settings = {} as ChordDesignerSettingsT

	shouldUseVelocityRange = false

	constructor(args: ChordDesignerArgsT) {
		this.chord = args.chord
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

	octave = (octave: number) => {
		this.settings.octave = octave
		return this
	}

	inversion = (inversion: number) => {
		this.settings.inversion = inversion
		return this
	}

	voicing = (voicing: VoicingT | string) => {
		this.settings.voicing = voicing
		return this
	}

	bassNote = (note: string | number) => {
		this.settings.bassNote = note
		return this
	}

	bassOctave = (octave: number) => {
		this.settings.bassOctave = octave
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
		// Parse the chord into notes
		let notes = this.getChordNotes()

		// Apply voicing if specified
		if (this.settings.voicing) {
			notes = this.applyVoicing(notes)
		}

		// Apply inversion if specified
		if (this.settings.inversion) {
			notes = this.applyInversion(notes)
		}

		// Add bass note if specified
		if (this.settings.bassNote) {
			notes = this.addBassNote(notes)
		}

		// Create a NotesDesigner with the processed notes
		const notesDesigner = new NotesDesigner({
			notes,
			instrument: this.instrument
		})

		// Transfer all settings to the notes designer
		return notesDesigner
			.after(this.settings.after || 0)
			.duration(this.settings.duration || 0)
			.velocity(this.settings.velocity || 0)
			.minVelocity(this.settings.minVelocity || 0)
			.maxVelocity(this.settings.maxVelocity || 0)
			.stagger(this.settings.stagger || 0)
			.detune(this.settings.detune || 0)
			.attack(this.settings.attack || 0)
			.release(this.settings.release || 0)
			.gain(this.settings.gain || 0)
			.pan(this.settings.pan || 0)
			.play()
	}

	stop = () => {
		// Stop all notes in this chord
		const notes = this.getChordNotes()
		notes.forEach(note => this.instrument.stop(note))
	}

	private getChordNotes = (): string[] => {
		try {
			// Use Tonal to get chord notes
			const chordNotes = Chord.get(this.chord).notes
			
			if (chordNotes.length === 0) {
				console.warn(`Could not parse chord: ${this.chord}`)
				return [this.chord] // Fallback to treating it as a single note
			}

			// Apply octave if specified
			const octave = this.settings.octave || 3
			return chordNotes.map(note => `${note}${octave}`)
		} catch (error) {
			console.warn(`Error parsing chord ${this.chord}:`, error)
			return [this.chord] // Fallback
		}
	}

	private applyVoicing = (notes: string[]): string[] => {
		const voicing = this.settings.voicing
		if (!voicing) return notes

		// Check if it's a custom voicing function
		const customVoicings = this.instrument?.parent?.wembley?.voicings || {}
		if (typeof voicing === 'string' && customVoicings[voicing]) {
			const voicingFunction = customVoicings[voicing] as VoicingFunctionT
			return voicingFunction(notes)
		}

		// Apply built-in voicings
		switch (voicing) {
			case 'open':
				// Spread notes across multiple octaves
				return notes.map((note, index) => {
					const octave = 3 + Math.floor(index / 2)
					return note.replace(/\d+$/, octave.toString())
				})
			
			case 'closed':
				// Keep all notes in the same octave
				return notes
			
			case 'drop2':
				// Move the second highest note down an octave
				if (notes.length >= 2) {
					const result = [...notes]
					const secondHighest = result[result.length - 2]
					const lowerOctave = parseInt(secondHighest.slice(-1)) - 1
					result[result.length - 2] = secondHighest.replace(/\d+$/, lowerOctave.toString())
					return result
				}
				return notes
			
			case 'rootless':
				// Remove the root note
				return notes.slice(1)
			
			case 'shell':
				// Keep only the 1st and 3rd (or 1st, 3rd, 7th for extended chords)
				return notes.length > 2 ? [notes[0], notes[2]] : notes
			
			default:
				return notes
		}
	}

	private applyInversion = (notes: string[]): string[] => {
		const inversion = this.settings.inversion
		if (!inversion || inversion === 0) return notes

		// Rotate the notes for the inversion
		const rotated = [...notes]
		for (let i = 0; i < inversion; i++) {
			const first = rotated.shift()
			if (first) {
				// Move the first note up an octave when moving to bass
				const octave = parseInt(first.slice(-1)) + 1
				const noteWithHigherOctave = first.replace(/\d+$/, octave.toString())
				rotated.push(noteWithHigherOctave)
			}
		}
		return rotated
	}

	private addBassNote = (notes: string[]): string[] => {
		const bassNote = this.settings.bassNote
		const bassOctave = this.settings.bassOctave || 2
		
		if (typeof bassNote === 'string') {
			const bassNoteWithOctave = `${bassNote}${bassOctave}`
			return [bassNoteWithOctave, ...notes]
		} else if (typeof bassNote === 'number') {
			// It's an index into the chord notes
			const noteIndex = bassNote % notes.length
			const selectedNote = notes[noteIndex]
			const noteWithBassOctave = selectedNote.replace(/\d+$/, bassOctave.toString())
			return [noteWithBassOctave, ...notes]
		}
		
		return notes
	}
}