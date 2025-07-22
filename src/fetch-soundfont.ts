import { to } from 'await-to-js'
import { throwShit } from './throwShit.js'
import { parse, SoundFont } from '@marmooo/soundfont-parser'

export const fetchSoundfont = async (url: string): Promise<SoundFont> => {
	const [error, response] = await to(fetch(url))
	if (error) return throwShit('networkError', { error, url })
	const arrayBuffer = await response?.arrayBuffer()
	const buffer = new Uint8Array(arrayBuffer)
	const parsed = parse(buffer)
	const soundFont = new SoundFont(parsed)
	return soundFont
}
