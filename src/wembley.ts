import type { WembleyT, ConfigT } from './types.js'
import { createPlayer } from './player.js'

export const createWembley = (): WembleyT => {
  const wembley: WembleyT = {
    configure: (config?: ConfigT) => {
      const finalConfig: ConfigT = {
        gain: 70,
        maxVelocity: 85,
        minVelocity: 45,
        voicings: {},
        ...config
      }
      
      console.log('Configuring wembley with:', finalConfig)
      
      return createPlayer({ config: finalConfig })
    }
  }

  return wembley
}