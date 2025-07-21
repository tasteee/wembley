import type { PlayerT, ConfigT, SoundfontLoadConfigT, GearT, InstrumentT } from './types.js'
import { createInstrument } from './instrument.js'
import { audioEngine } from './audio-engine.js'

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