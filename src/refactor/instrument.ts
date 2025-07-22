// TODO: Replace instrument.ts with this file.

import { NoteDesigner } from './note-designer'
import { BaseSettingsT, StopTargetT } from '../types'

export class Instrument {
	id = crypto.randomUUID()
	parent = null
	name = ''

	originalConfig = {}
	soundfont = null
	settings = {} as BaseSettingsT

	constructor(loadResult, parent) {
		this.id = crypto.randomUUID()
		this.parent = parent
		this.name = loadResult.name
		this.soundfont = loadResult.soundfont
		this.originalConfig = loadResult.config
		this.settings.minVelocity = loadResult.config.minVelocity
		this.settings.maxVelocity = loadResult.config.maxVelocity
		this.settings.velocity = loadResult.config.velocity
		this.settings.gain = loadResult.config.gain
		this.settings.pan = loadResult.config.pan
	}

	note = (note: string | number) => {
		return new NoteDesigner(note)
	}

	// stop() // stop all notes played by instrument
	// stop('C3') // stop one note played by instrument
	// stop(['C3', 'D3']) // stop multiple notes played by instrument
	// stop('Cmin', 3) // stop multiple notes played by instrument
	stop = (target: StopTargetT, octave?: number) => {
		console.log(`[Instrument.stop target]:`, target)
		// TODO...
	}
}
