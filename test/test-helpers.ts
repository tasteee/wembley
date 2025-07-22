import { wembley } from '../src'

const PIANO_URL = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-ogg.js'

// for when you just need gear, but not
// too concerned about its setup.
export const getGear = (overrides: any = {}) => {
	return wembley.initialize({
		gain: 20,
		velocity: 50,
		pan: 0,

		instruments: {
			piano: {
				url: PIANO_URL
			}
		},

		...overrides
	})
}
