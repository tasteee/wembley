import { NoteDesigner } from './note-designer.js'
import { NotesDesigner } from './notes-designer.js'
import { ChordDesigner } from './chord-designer.js'
import { audioEngine } from './audio-engine.js'
import type { AudioSynthT, AudioFontT } from './audio-engine.js'

type InstrumentLoadResultT = {
	name: string
	soundfont: AudioFontT
	config: InstrumentConfigT
}

type InstrumentSettingsT = {
	id: string
	name: string
	url: string
	pan: number
	gain: number
	velocity: number
	minVelocity: number
	maxVelocity: number
	duration: number
	soundfont: any
	originalConfig: NewSoundfontLoadConfigT
}

export class Instrument implements InstrumentT {
	id = crypto.randomUUID()
	parent = null
	name = ''
	isLoaded = false

	originalConfig = {} as InstrumentConfigT
	soundfont = null as AudioFontT | null
	synth = null as AudioSynthT | null
	settings = {} as InstrumentSettingsT

	constructor(loadResult: InstrumentLoadResultT, parent: any) {
		this.id = crypto.randomUUID()
		this.parent = parent
		this.name = loadResult.name
		this.soundfont = loadResult.soundfont
		this.originalConfig = loadResult.config

		// Initialize settings with defaults and config overrides
		this.settings = {
			id: this.id,
			name: loadResult.name,
			url: loadResult.config.url,
			minVelocity: loadResult.config.minVelocity || parent?.settings?.minVelocity || 60,
			maxVelocity: loadResult.config.maxVelocity || parent?.settings?.maxVelocity || 80,
			velocity: loadResult.config.velocity || parent?.settings?.velocity || 75,
			gain: loadResult.config.gain || parent?.settings?.gain || 50,
			pan: loadResult.config.pan || parent?.settings?.pan || 0,
			duration: loadResult.config.velocity || parent?.settings?.duration || 1000, // Default duration
			soundfont: loadResult.soundfont,
			originalConfig: { [loadResult.name]: loadResult.config }
		}
	}

	load = async () => {
		if (this.isLoaded) return this
		// Create synth for this instrument
		this.synth = await audioEngine.createSynth({
			soundfont: this.soundfont,
			config: this.settings
		})
		this.isLoaded = true
		return this
	}

	note = (note: string) => {
		return new NoteDesigner({ note, instrument: this })
	}

	notes = (notes: string[]) => {
		return new NotesDesigner({ notes, instrument: this })
	}

	chord = (chord: string, octave?: number) => {
		return new ChordDesigner({ chord, octave, instrument: this })
	}

	// stop() // stop all notes played by instrument
	// stop('C3') // stop one note played by instrument
	// stop(['C3', 'D3']) // stop multiple notes played by instrument
	// stop('Cmin', 3) // stop multiple notes played by instrument
	stop = (target?: StopTargetT): any => {
		console.log(`[Instrument.stop target]:`, target)
		if (!this.synth) return []

		if (!target) {
			// Stop all notes from this instrument
			this.synth.stopAllNotes()
			return []
		}

		// TODO: Implement selective stopping based on target
		// For now, just stop all notes
		this.synth.stopAllNotes()
		return []
	}
}
