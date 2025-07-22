import type { PlayerT, ConfigT, SoundfontLoadConfigT, GearT, InstrumentT, NewSoundfontLoadConfigT, InstrumentConfigT } from './types.js'
import { createInstrument } from './instrument.js'
import { audioEngine } from './audio-engine.js'

export const loadInstrumentsWithNewFormat = async (
  instrumentsConfig: Record<string, InstrumentConfigT>,
  globalConfig: ConfigT
): Promise<Record<string, InstrumentT>> => {
  console.log('Loading instruments with new format:', instrumentsConfig)
  const instruments: Record<string, InstrumentT> = {}

  for (const [name, instrumentConfig] of Object.entries(instrumentsConfig)) {
    console.log(`Loading ${name} from ${instrumentConfig.url}...`)

    // Merge global config with per-instrument config
    const mergedConfig: ConfigT = {
      ...globalConfig,
      ...(instrumentConfig.gain !== undefined && { gain: instrumentConfig.gain }),
      ...(instrumentConfig.minVelocity !== undefined && { minVelocity: instrumentConfig.minVelocity }),
      ...(instrumentConfig.maxVelocity !== undefined && { maxVelocity: instrumentConfig.maxVelocity }),
      ...(instrumentConfig.pan !== undefined && { pan: instrumentConfig.pan })
    }

    // Load the actual soundfont using the audio engine
    const soundfont = await audioEngine.loadSoundfont({ url: instrumentConfig.url })
    const synth = audioEngine.createSynth({ soundfont, config: mergedConfig })

    instruments[name] = createInstrument({
      name,
      synth,
      soundfontUrl: instrumentConfig.url,
      config: mergedConfig
    })

    console.log(`✓ ${name} loaded successfully`)
  }

  return instruments
}

export const createEnhancedGear = (
  initialInstruments: Record<string, InstrumentT>,
  globalConfig: ConfigT
): GearT => {
  let allInstruments = { ...initialInstruments }

  const load = async (newInstrumentsConfig: NewSoundfontLoadConfigT) => {
    const newInstruments = await loadInstrumentsWithNewFormat(newInstrumentsConfig, globalConfig)
    allInstruments = { ...allInstruments, ...newInstruments }
    
    // Add the new instruments to the current gear object
    Object.assign(gear, newInstruments)
    
    // Return the same gear object (but with new instruments added)
    return gear
  }

  const stop = () => {
    console.log('Stopping all sounds from all instruments')
    const instruments = Object.values(allInstruments)
    instruments.forEach(instrument => instrument.stop())
  }

  const gear = { ...allInstruments, load, stop } as GearT
  return gear
}

export const createPlayer = (config: ConfigT) => {
  const load = async (soundfontLoadConfig: SoundfontLoadConfigT) => {
    console.log('Loading soundfonts:', soundfontLoadConfig)
    const instruments: Record<string, InstrumentT> = {}

    for (const [name, url] of Object.entries(soundfontLoadConfig)) {
      console.log(`Loading ${name} from ${url}...`)

      // Load the actual soundfont using the audio engine
      const soundfont = await audioEngine.loadSoundfont({ url })
      const synth = audioEngine.createSynth({ soundfont, config })

      instruments[name] = createInstrument({
        name,
        synth,
        soundfontUrl: url,
        config
      })

      console.log(`✓ ${name} loaded successfully`)
    }

    const stop = () => {
      console.log('Stopping all sounds from all instruments')
      const allInstruments = Object.values(instruments)
      allInstruments.forEach(instrument => instrument.stop())
    }

    const gear = { ...instruments, stop }
    return gear as GearT
  }

  const player: PlayerT = {
    load,
  }

  return player
}