import { fetchSoundfont } from './fetchSoundfont'
import { Instrument } from './instrument-class'
import { BaseSettingsT, InitializeConfigT, StopTargetT } from './types'

export class Gear {
	id = crypto.randomUUID()
	instruments = {} as Record<string, any>
	settings = {} as BaseSettingsT
	parent = null

	constructor(config: InitializeConfigT, parent) {
		this.settings.minVelocity = parent.settings.minVelocity
		this.settings.maxVelocity = parent.settings.maxVelocity
		this.settings.velocity = parent.settings.velocity
		this.settings.gain = parent.settings.gain
		this.settings.pan = parent.settings.pan
		this.parent = parent

		const instrumentConfigs = Object.entries(config.instruments || {})
		const instrumentPromises = [] as any[]

		for (const [name, config] of instrumentConfigs) {
			const promise = fetchSoundfont(config.url)
			const then = (soundfont) => ({ name, soundfont, config })
			instrumentPromises.push(promise.then(then))
		}

		Promise.all(instrumentPromises).then((loadedInstruments) => {
			for (const loadedInstrument of loadedInstruments) {
				this.instruments[loadedInstrument.name] = new Instrument(loadedInstrument, this)
			}
		})
	}

	// Broadcast the stop request to all gear instruments.
	stop = (target: StopTargetT) => {
		console.log(`[Gear.stop target]:`, target)
		const stopInstrument = (instrument) => instrument.stop(target)
		Object.values(this.instruments).forEach(stopInstrument)
	}
}
