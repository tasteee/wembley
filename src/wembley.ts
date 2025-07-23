import { DEFAULT_SETTINGS } from './constants'
import { Gear } from './gear'

export class Wembley {
	id = crypto.randomUUID()
	gears = {} as Record<string, any>
	settings = DEFAULT_SETTINGS as BaseSettingsT
	playingNotes = []

	initialize = async (config: InitializeConfigT): Promise<Gear> => {
		if (config.minVelocity) this.settings.minVelocity = config.minVelocity
		if (config.maxVelocity) this.settings.maxVelocity = config.maxVelocity
		if (config.velocity) this.settings.velocity = config.velocity
		if (config.gain) this.settings.gain = config.gain
		if (config.pan) this.settings.pan = config.pan
		const gear = new Gear(config, this)
		this.gears[gear.id] = gear
		await gear.loadInitialInstruments()
		return gear
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

export const createWembley = (): Wembley => {
	return new Wembley()
}
