import type { WembleyT, ConfigT, InitializeConfigT } from './types.js'
import { createPlayer, loadInstrumentsWithNewFormat, createEnhancedGear } from './player.js'

export const createWembley = (): WembleyT => {
  const configure = (config?: ConfigT) => {
    return createPlayer({
      gain: 70,
      maxVelocity: 85,
      minVelocity: 45,
      voicings: {},
      ...config
    })
  }

  const initialize = async (config: InitializeConfigT) => {
    const globalConfig: ConfigT = {
      gain: 70,
      maxVelocity: 85,
      minVelocity: 45,
      pan: 0,
      voicings: {},
      ...config
    }

    const instrumentsConfig = config.instruments || {}
    const initialInstruments = await loadInstrumentsWithNewFormat(instrumentsConfig, globalConfig)
    
    return createEnhancedGear(initialInstruments, globalConfig)
  }

  const wembley: WembleyT = { configure, initialize }
  return wembley
}