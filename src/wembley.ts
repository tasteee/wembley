import type { WembleyT, ConfigT } from './types.js'
import { createPlayer } from './player.js'

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

  const wembley: WembleyT = { configure }
  return wembley
}