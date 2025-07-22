import { describe, it, expect } from '@jest/globals'
import { wembley } from '../src'
import { getGear } from './test-helpers'

describe('wembley', () => {
	it('gear should have correct api', async () => {
		const gear = await getGear()
		expect(gear).toBeDefined()
		// gear.load({ instrumentName: { ...config }})
		expect(gear.load).toBeDefined()
		expect(typeof gear.load).toBe('function')
		// gear.stop()
		expect(gear.stop).toBeDefined()
		expect(typeof gear.stop).toBe('function')
	})

	it('gear instrument should have correct api', async () => {
		const gear = await getGear()
		expect(gear.piano).toBeDefined()

		// gear.piano.note('C3') // play C3 on piano
		expect(gear.piano.note).toBeDefined()
		expect(typeof gear.piano.note).toBe('functiion')
		expect(gear.piano.note.length).toBe(1)

		// gear.piano.notes(['C3', 'D4']) // play C3 and D4 on piano
		expect(gear.piano.notes).toBeDefined()
		expect(typeof gear.piano.notes).toBe('functiion')
		expect(gear.piano.notes.length).toBe(1)

		// gear.piano.chord('Cmin', 2) // play the notes of Cmin based in octave 2 on piano
		expect(gear.piano.chord).toBeDefined()
		expect(typeof gear.piano.chord).toBe('functiion')
		expect(gear.piano.chord.length).toBe(2)

		// gear.piano.stop() // stop all noteInstances played by piano
		// gear.piano.stop('C3') // stop all C3 noteInstances played by piano
		// gear.piano.stop(['C3', 'F4']) // stop all C3 and F4 noteInstances played by piano
		expect(gear.piano.stop).toBeDefined()
		expect(typeof gear.piano.stop).toBe('functiion')
		expect(gear.piano.stop.length).toBe(1)
	})

	const expectFunctionWithArgCount = (target, argvCount) => {
		expect(target).toBeDefined()
		expect(typeof target).toBe('function')
		expect(target.length).toBe(argvCount)
	}

	it('NoteBuilderT should have correct API', async () => {
		const gear = await getGear()
		const note = gear.piano.note('C3')
		expect(note).toBeDefined()
		expectFunctionWithArgCount(note.play, 0)
		expectFunctionWithArgCount(note.stop, 0)
		expectFunctionWithArgCount(note.after, 1)
		expectFunctionWithArgCount(note.duration, 1)
		expectFunctionWithArgCount(note.minVelocity, 1)
		expectFunctionWithArgCount(note.maxVelocity, 1)
		expectFunctionWithArgCount(note.gain, 1)
		expectFunctionWithArgCount(note.pan, 1)
		expectFunctionWithArgCount(note.detune, 1)
		expectFunctionWithArgCount(note.attack, 1)
		expectFunctionWithArgCount(note.release, 1)
	})

	it('NotesBuilderT should have correct API', async () => {
		const gear = await getGear()
		const notes = gear.piano.notes(['C3', 'E4'])
		expect(notes).toBeDefined()
		expectFunctionWithArgCount(notes.play, 0)
		expectFunctionWithArgCount(notes.stop, 0)
		expectFunctionWithArgCount(notes.after, 1)
		expectFunctionWithArgCount(notes.duration, 1)
		expectFunctionWithArgCount(notes.minVelocity, 1)
		expectFunctionWithArgCount(notes.maxVelocity, 1)
		expectFunctionWithArgCount(notes.gain, 1)
		expectFunctionWithArgCount(notes.pan, 1)
		expectFunctionWithArgCount(notes.detune, 1)
		expectFunctionWithArgCount(notes.attack, 1)
		expectFunctionWithArgCount(notes.release, 1)
	})

	it('ChordBuilderT should have correct API', async () => {
		const gear = await getGear()
		const chord = gear.piano.chord('C3')
		expect(chord).toBeDefined()
		expectFunctionWithArgCount(chord.play, 0)
		expectFunctionWithArgCount(chord.stop, 0)
		expectFunctionWithArgCount(chord.after, 1)
		expectFunctionWithArgCount(chord.duration, 1)
		expectFunctionWithArgCount(chord.minVelocity, 1)
		expectFunctionWithArgCount(chord.maxVelocity, 1)
		expectFunctionWithArgCount(chord.gain, 1)
		expectFunctionWithArgCount(chord.pan, 1)
		expectFunctionWithArgCount(chord.detune, 1)
		expectFunctionWithArgCount(chord.attack, 1)
		expectFunctionWithArgCount(chord.release, 1)
	})

	it('should not error when using NoteDesignerT API', async () => {
		const gear = await getGear()

		expect(() => {
			gear.piano.notes(['C3', 'E4']).play()
			gear.piano.notes(['C3', 'E4']).stagger(150).play()
			gear.piano.notes(['C3', 'E4']).velocity(65).after(150).play()
		}).not.toThrow()
	})

	it('should not error when using ChordDesignerT API', async () => {
		const gear = await getGear()

		expect(() => {
			gear.piano.chord('F#').octave(3).inversion(1).voicing('cluster').bassNote('B').play()
		}).not.toThrow()
	})

	it('should handle all voicing types', async () => {
		const gear = await getGear()

		const voicings = [
			'open',
			'closed',
			'drop2',
			'drop3',
			'drop2and4',
			'rootless',
			'spread',
			'cluster',
			'shell',
			'pianistic',
			'guitaristic',
			'orchestral'
		]

		for (const voicing of voicings) {
			expect(() => {
				gear.piano
					.chord('Cmaj7')
					.voicing(voicing as any)
					.play()
			}).not.toThrow()
		}
	})

	it('should handle custom config voicings correctly', async () => {
		const gear = await getGear({
			voicings: {
				reversed: (notes) => notes.reverse(),
				only2and3: (notes) => [notes[1], notes[2]]
			}
		})

		expect(() => {
			gear.piano.chord('Cmaj7').voicing('reversed').play()
			gear.piano.chord('Cmaj7').voicing('only2and3').play()
		}).not.toThrow()
	})

	it('should handle stop API correctly', async () => {
		const gear = await getGear()

		expect(() => {
			const note = gear.piano.note('C3').play()
			note.stop()
			const anotherNote = gear.piano.note('D3').play()
			anotherNote.after(300).gain(0).pan(30).stop()
		}).not.toThrow()
	})
})
