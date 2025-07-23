import { fetchSoundfont } from './fetch-soundfont'
import { Instrument } from './instrument'
import { DEFAULT_SETTINGS } from './constants'
import { Wembley } from './wembley'
import type { 
	InstrumentConfigMapT, 
	BaseSettingsT, 
	InitializeConfigT, 
	NewSoundfontLoadConfigT, 
	InstrumentMapT, 
	StopTargetT 
} from './types.js'

// TODO: Error if dev tries to load an instrument
// with the name that matches an existing property
// of the Gear class.

export class Gear {
	// Index signature for dynamic instrument properties
	[key: string]: any

	id = crypto.randomUUID()
	parent = null! as Wembley

	private instrumentNames = [] as string[]
	private instrumentsConfig = {} as InstrumentConfigMapT
	settings = {} as BaseSettingsT

	constructor(config: InitializeConfigT, wembley: Wembley) {
		this.parent = wembley
		const { instruments, voicings, ...rest } = config
		this.settings = { ...DEFAULT_SETTINGS, ...rest }
		this.instrumentsConfig = instruments || ({} as InstrumentConfigMapT)
	}

	// Take the instrument config we alreay received in constructor,
	// and perform the async task of loadInstruments here, since
	// a constructor cannot be async. It is called directly after creation:
	// const gears = new Gear({ ... })
	// await gears.loadInitialInstruments()
	loadInitialInstruments = async () => {
		if (!this.instrumentsConfig) return
		console.log('[loadInitialInstruments] Loading instruments:', this.instrumentsConfig)
		await this.loadInstruments(this.instrumentsConfig)
	}

	loadInstruments = async (loadConfig: NewSoundfontLoadConfigT) => {
		const instrumentEntries = Object.entries(loadConfig)
		const instrumentLoaders = [] as any

		for (const [name, config] of instrumentEntries) {
			console.log('loading soundfont for', name)
			const promise = fetchSoundfont(config.url).then((rawfont) => {
				console.log('soundfont loaded for', name)
				const soundfont = { name, url: config.url, soundfont: rawfont }
				const instrument = new Instrument({ name, soundfont, config }, this)
				return instrument.load()
			})

			instrumentLoaders.push(promise)
		}

		console.log('waiting for soundfonts to load...')
		const instruments = await Promise.all(instrumentLoaders)
		console.log('soundfonts all loaded and shit, instruments all the way created and shit')
		instruments.forEach((instrument) => (this[instrument.name] = instrument))
	}

	get instruments(): InstrumentMapT {
		return this.instrumentNames.reduce((final, name) => {
			final[name] = this[name]
			return final
		}, {})
	}

	stop = (target?: StopTargetT): any => {
		console.log(`[Gear.stop target]:`, target)
		const instrumentList = Object.values(this.instruments)
		instrumentList.forEach((instrument) => instrument.stop(target))
		// For now, return empty array - we'll implement proper note tracking later
		return []
	}

	// Alias for loadInstruments to match GearT type definition
	load = async (config: NewSoundfontLoadConfigT) => {
		await this.loadInstruments(config)
		return this
	}

	// Alias for loadInstruments that loads a single instrument
	loadInstrument = async (config: NewSoundfontLoadConfigT) => {
		await this.loadInstruments(config)
		// Return the first loaded instrument
		const instrumentNames = Object.keys(config)
		const firstInstrumentName = instrumentNames[0]
		return this[firstInstrumentName]
	}
}
