type NoteDesignerSettingsT = {
	after?: number | string
	duration?: number | string
	velocity?: number | string
	minVelocity?: number | string
	maxVelocity?: number | string
	detune: number | string
	attack?: number | string
	release?: number | string
	gain?: number | string
	pan?: number | string
}

export class NoteDesigner {
	note = '' as string | number
	settings = {} as NoteDesignerSettingsT

	shouldUseVelocityRange = false
	shouldUsePanRange = false

	constructor(note: string | number) {
		this.note = note
	}

	after = (milliseconds: number) => {
		this.settings.after = milliseconds
		return this
	}

	velocity = (velocity: number) => {
		this.settings.velocity = velocity
		this.shouldUseVelocityRange = false
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

	play = (overrides: Partial<NoteDesignerSettingsT> = {}) => {
		const noteSettings = {
			...this.settings,
			...overrides,
			note: this.note
		}

		// TODO: Play the note with the given settings.
	}
}
