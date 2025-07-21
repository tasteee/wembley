import type { PlayerT, ConfigT, SoundfontLoadConfigT, GearT } from './types.js'
import { createInstrument } from './instrument.js'
import { audioEngine } from './audio-engine.js'

export const createPlayer = (args: { config: ConfigT }) => {
  const player: PlayerT = {
    load: async (config: SoundfontLoadConfigT) => {
      console.log('Loading soundfonts:', config)
      
      const gear: GearT = {}
      
      // Create instruments for each soundfont
      for (const [name, url] of Object.entries(config)) {
        console.log(`Loading ${name} from ${url}...`)
        
        // Load the actual soundfont using the audio engine
        const soundfont = await audioEngine.loadSoundfont({ url })
        const synth = audioEngine.createSynth({ soundfont, config: args.config })
        
        gear[name] = createInstrument({
          name,
          soundfontUrl: url,
          synth,
          config: args.config
        })
        
        console.log(`✓ ${name} loaded successfully`)
      }
      
      return gear
    }
  }

  return player
}