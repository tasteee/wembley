import { NoteInstanceT, StopTargetT } from '../types'

// TODO: Make typescript register src/types.d.ts GLOBALLY
// so we dont have to import all the types everywhere
// and the TS errors in this file GO AWAY WITHOUT IMPORTS.

// NoteInstanceMap extends Array to provide a more
// structured way to store and retrieve related note instances.
// It is meant particularly for cases like grouping
// notes([...]) instances together. I have considered how
// it could be scaled to maybe handle all notes for a
// specific instrument, or bigger tasks like that, but
// I havent worked through how all that should work yet.

// It is half map and half array, so it can be iterate
// with for loops, or forEach, map, etc.

export class NoteInstanceMap extends Array<NoteInstanceT> {
	notes: string[]

	constructor(noteInstances: NoteInstanceT[]) {
		super(...noteInstances)
		this.notes = noteInstances.map((instance) => instance.name)
	}

	get = (note: string): NoteInstanceT | undefined => {
		return this.find((instance) => instance.name === note)
	}

	has = (note: string): boolean => {
		return this.some((instance) => instance.name === note)
	}

	// If number arg is passed, it is put in array and stops all matching notes.
	// If string arg is passed, it is put in array and stops all matching notes.
	// If array arg is passed, it stops all matching notes.
	// If no arg passed, stops all notes in this.notes array.
	stop = (target: StopTargetT = this.notes): void => {
		const isArray = Array.isArray(target)
		const notesToStop = isArray ? target : ([target] as string[])

		notesToStop.forEach((note) => {
			const instance = this.get(note)
			if (!instance) return
			instance.stop()
		})
	}

	get hasPlayingNotes() {
		return this.some((instance) => instance.isPlaying)
	}
}
