import type { PlayerT, ConfigT, SoundfontLoadConfigT, GearT, InstrumentT } from './types.js'
import { createInstrument } from './instrument.js'
import { audioEngine } from './audio-engine.js'

export const createPlayer = (args: { config: ConfigT }) => {
  const player: PlayerT = {
    load: async (config: SoundfontLoadConfigT) => {
      console.log('Loading soundfonts:', config)
      
      const instruments: Record<string, InstrumentT> = {}
      
      // Create instruments for each soundfont
      for (const [name, url] of Object.entries(config)) {
        console.log(`Loading ${name} from ${url}...`)
        
        // Load the actual soundfont using the audio engine
        const soundfont = await audioEngine.loadSoundfont({ url })
        const synth = audioEngine.createSynth({ soundfont, config: args.config })
        
        instruments[name] = createInstrument({
          name,
          soundfontUrl: url,
          synth,
          config: args.config
        })
        
        console.log(`✓ ${name} loaded successfully`)
      }

      // Create gear with global stop functionality
      const gear = {
        ...instruments,
        stop: () => {
          console.log('Stopping all sounds from all instruments')
          Object.values(instruments).forEach(instrument => {
            instrument.stop()
          })
        }
      } as GearT
      
      return gear
    }
  }

  return player
}