import type { WembleyT, ConfigT, InitializeConfigT, StopTargetT, BaseSettingsT, GearT, InstrumentConfigT, NewSoundfontLoadConfigT } from '../types.js'
import { fetchSoundfont } from './fetch-soundfont.js'
import { listerine } from 'listerine'
import { DEFAULT_SETTINGS } from './constants.js'
import { Instrument } from './instrument.js'

class Gear implements GearT {
	[key: string]: any // Index signature for dynamic instrument properties
	id = crypto.randomUUID()
	wembley = null
	instruments = {} as Record<string, Instrument>
	settings = {} as BaseSettingsT

	constructor(config: InitializeConfigT, wembley: Wembley) {
		this.wembley = wembley
		this.settings = { ...DEFAULT_SETTINGS, ...config }
	}

	loadInitialInstruments = async (config: InitializeConfigT) => {
		if (!config.instruments) return

		for (const [name, instrumentConfig] of Object.entries(config.instruments)) {
			await this.loadSingleInstrument(name, instrumentConfig)
		}
	}

	// This matches the GearT interface
	loadInstrument = async (config: NewSoundfontLoadConfigT) => {
		// Handle single instrument loading from config object
		const instrumentName = Object.keys(config)[0]
		const instrumentConfig = config[instrumentName]
		
		const rawSoundfont = await fetchSoundfont(instrumentConfig.url)
		const audioFont = {
			name: instrumentName,
			url: instrumentConfig.url,
			soundfont: rawSoundfont,
			samples: new Map(),
			isLoaded: true
		}
		
		const instrument = new Instrument({ name: instrumentName, soundfont: audioFont, config: instrumentConfig }, this)
		this.instruments[instrumentName] = instrument
		// Add instrument to gear object dynamically
		this[instrumentName] = instrument
		return instrument
	}

	// Convenience method that matches API expectations
	load = async (config: NewSoundfontLoadConfigT) => {
		// Load multiple instruments from config object
		const results = []
		for (const [name, instrumentConfig] of Object.entries(config)) {
			const rawSoundfont = await fetchSoundfont(instrumentConfig.url)
			const audioFont = {
				name,
				url: instrumentConfig.url,
				soundfont: rawSoundfont,
				samples: new Map(),
				isLoaded: true
			}
			
			const instrument = new Instrument({ name, soundfont: audioFont, config: instrumentConfig }, this)
			this.instruments[name] = instrument
			// Add instrument to gear object dynamically
			this[name] = instrument
			results.push(instrument)
		}
		return results.length === 1 ? results[0] : results
	}

	// Internal method for loading individual instruments
	private loadSingleInstrument = async (name: string, config: InstrumentConfigT) => {
		const rawSoundfont = await fetchSoundfont(config.url)
		const audioFont = {
			name,
			url: config.url,
			soundfont: rawSoundfont,
			samples: new Map(),
			isLoaded: true
		}
		
		const instrument = new Instrument({ name, soundfont: audioFont, config }, this)
		this.instruments[name] = instrument
		// Add instrument to gear object dynamically
		this[name] = instrument
		return instrument
	}

	stop = (target?: StopTargetT): any => {
		console.log(`[Gear.stop target]:`, target)
		Object.values(this.instruments).forEach((instrument) => instrument.stop(target))
		// For now, return empty array - we'll implement proper note tracking later
		return []
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

	initialize = async (config: InitializeConfigT): Promise<GearT> => {
		if (config.minVelocity) this.settings.minVelocity = config.minVelocity
		if (config.maxVelocity) this.settings.maxVelocity = config.maxVelocity
		if (config.velocity) this.settings.velocity = config.velocity
		if (config.gain) this.settings.gain = config.gain
		if (config.pan) this.settings.pan = config.pan

		const gear = new Gear(config, this)
		this.gears[gear.id] = gear
		await gear.loadInitialInstruments(config)
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

export const createWembley = (): WembleyT => {
	return new Wembley()
}
