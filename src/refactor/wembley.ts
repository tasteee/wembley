import type { WembleyT, ConfigT, InitializeConfigT, StopTargetT, BaseSettingsT } from '../types.js'
import { createPlayer, loadInstrumentsWithNewFormat, createEnhancedGear } from '../player.js'
import { fetchSoundfont } from './fetch-soundfont.js'
import { listerine } from 'listerine'
import { NoteDesigner } from './note-designer.js'

// When chord(...).play(), we take the symbol,
// convert it into notes, and play them with the
// given settings. We store each played note instance
// in playTracker.active.notes, and we save
// all of the played note instances together
// in active.chords.

// So we can do chord(...).stop() and we can easily
// look up the chord (an array of note instances),
// and stop each of them.

// note(C4).play() -> active.notes.set(C4I, )
// note(C4).stop() =>

// type NoteInstanceT = { id: string, createdAt: number, }
// const list = listerine(arraOfItems)

class PlayTracker {
	private instances = [] as any[]
	private instanceGroups = {}

	add = (instance: any) => {
		this.instances.push(instance)
	}

	find = (query) => {
		const list = listerine(this.instances)
		return list.find(query)
	}

	findOne = (query) => {
		const list = listerine(this.instances)
		return list.findOne(query)
	}
}

// const gear = await wembley.initialize(config)
// gear.piano.note('C3').play()
// gear.piano.chord('Cmaj').play()
// gear.piano.notes(['C3', 'E3', 'G3']).play()
// gear.piano.note('C3').stop()
// gear.piano.chord('Cmaj').stop()
// gear.piano.notes(['C3', 'E3', 'G3']).stop()
// gear.stop() // stop all notes on all instruments
// gear.stop('C3') // stop only C3 note on all instruments
// gear.stop(['C3', 'E3']) // stop C3 and E3 notes on all instruments

class Wembley {
	id = crypto.randomUUID()
	gears = {} as Record<string, any>
	settings = DEFAULT_SETTINGS as BaseSettingsT
	playingNotes = []

	initialize = async (config: InitializeConfigT) => {
		if (config.minVelocity) this.settings.minVelocity = config.minVelocity
		if (config.maxVelocity) this.settings.maxVelocity = config.maxVelocity
		if (config.velocity) this.settings.velocity = config.velocity
		if (config.gain) this.settings.gain = config.gain
		if (config.pan) this.settings.pan = config.pan

		const gear = new Gear(config, this)
		this.gears[gear.id] = gear
	}

	// Dispatch the stop request to all gears, and as a
	// result, to all instruments.
	stop = (target: StopTargetT) => {
		console.log(`[Wembley.stop target]:`, target)
		Object.values(this.gears).forEach((gear) => gear.stop(target))
	}

	// Update the global settings.
	// These are the last fallback for when
	// neither a note, instrument, or gear are missing a value.
	// wembley.set({ minVelocity: 22 })
	set = (settings: any) => {
		Object.assign(this.settings, settings)
	}
}

// Ŵ Ⅲ ⩥ ϒ ϡ ᾞ Ὃ Ὂ ᾥ ᾧ ϟ ϰ ⨘ ⨌ ⋱ ⋰ ⋯ ⋮ ⋁⋀ ≪≫∏ ∐ [⟫ϒ⋁ϒ⋀⟪]
const WEMBLEY_LOG_PREFIX = '🎺 Ⅰ⋮⋮⋮⋮⋮⟫ wembley ⟪⋮⋮⋮⋮⋮Ⅰ  '
// ↅ ∎ ⅲ ↀ ↇ Ⅹ Ⅰ ⁼ ◤ ◥ ▼ ◀ ▶ ⇶ ⇛ ⇉ ⇇ ← → W Ṇ Ķ Ĥ ₯ ₩ ⌂ ✕ ✓ ⟫ ⟪ № — © •

const wembley = new Wembley()
