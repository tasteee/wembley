import { describe, it, expect } from '@jest/globals'
import { wembley } from '../src'
import { PIANO_URL } from './test-helpers'

describe('wembley.initialize() V1 API', () => {
	it('should support the new initialize API with instruments configuration', async () => {
		const gear = await wembley.initialize({
			// set some default values
			pan: 0,
			gain: 50,
			minVelocity: 25,
			maxVelocity: 75,

			// configure instruments to load immediately
			instruments: {
				piano: {
					url: PIANO_URL,
					minVelocity: 20,
					maxVelocity: 80,
					gain: 50,
					pan: 0
				},
				kalimba: {
					url: PIANO_URL,
					minVelocity: 20,
					maxVelocity: 80,
					gain: 50,
					pan: 0
				}
			}
		})

		// Should have loaded instruments directly
		expect(gear.piano).toBeDefined()
		expect(gear.kalimba).toBeDefined()

		// Should have the standard instrument interface
		expect(gear.piano.note).toBeDefined()
		expect(gear.piano.notes).toBeDefined()
		expect(gear.piano.chord).toBeDefined()
		expect(gear.piano.stop).toBeDefined()

		expect(gear.kalimba.note).toBeDefined()
		expect(gear.kalimba.notes).toBeDefined()
		expect(gear.kalimba.chord).toBeDefined()
		expect(gear.kalimba.stop).toBeDefined()

		// Should support standard usage
		expect(() => {
			gear.piano.note('C3').play()
			gear.kalimba.note('D4').play()
		}).not.toThrow()
	})

	it('should support loading additional instruments with new format', async () => {
		const gear = await wembley.initialize({
			gain: 60,
			minVelocity: 30,
			maxVelocity: 80,
			instruments: {
				piano: {
					url: PIANO_URL
				}
			}
		})

		expect(gear.piano).toBeDefined()

		await gear.loadInstruments({
			piano2: {
				url: PIANO_URL,
				gain: 70,
				minVelocity: 10,
				maxVelocity: 90,
				pan: -30
			},
			guitar: {
				url: PIANO_URL
			}
		})

		expect(gear.piano2).toBeDefined()
		expect(gear.guitar).toBeDefined()

		expect(() => {
			gear.piano2.note('E4').play()
			gear.guitar.chord('Am').play()
		}).not.toThrow()
	})

	it('should support minimal configuration with just instruments', async () => {
		const gear = await wembley.initialize({
			instruments: {
				simplePiano: {
					url: PIANO_URL
				}
			}
		})

		expect(gear.simplePiano).toBeDefined()
		expect(() => {
			gear.simplePiano.note('C4').play()
		}).not.toThrow()
	})

	it('should work with empty instruments object', async () => {
		const gear = await wembley.initialize({
			gain: 50,
			instruments: {}
		})

		expect(gear.stop).toBeDefined()
		expect(gear.load).toBeDefined()

		// Should be able to load instruments later
		await gear.loadInstruments({
			laterPiano: {
				url: PIANO_URL,
				gain: 80
			}
		})

		expect(gear.laterPiano).toBeDefined()
	})
})
