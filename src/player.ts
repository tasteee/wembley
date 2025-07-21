import type { PlayerT, ConfigT, SoundfontLoadConfigT, GearT } from './types.js'
import { createInstrument } from './instrument.js'

export const createPlayer = (args: { config: ConfigT }) => {
  const player: PlayerT = {
    load: async (config: SoundfontLoadConfigT) => {
      console.log('Loading soundfonts:', config)
      
      const gear: GearT = {}
      
      // Create instruments for each soundfont
      for (const [name, url] of Object.entries(config)) {
        // In a real implementation, this would load the actual soundfont
        // For now, we'll simulate the loading process
        console.log(`Loading ${name} from ${url}...`)
        
        // Simulate async loading
        await new Promise(resolve => setTimeout(resolve, 100))
        
        gear[name] = createInstrument({
          name,
          soundfontUrl: url,
          config: args.config
        })
        
        console.log(`✓ ${name} loaded successfully`)
      }
      
      return gear
    }
  }

  return player
}