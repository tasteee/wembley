import { NoteInstanceT, NoteInstanceSettingsT } from './types.js'
import { numbers } from './numbers'

export class NoteInstance implements NoteInstanceT {
	id = crypto.randomUUID()
	name: string
	settings: NoteInstanceSettingsT
	private audioContext: AudioContext
	private gainNode: GainNode
	private panNode: StereoPannerNode
	private sourceNode: AudioBufferSourceNode | null = null
	private isActive = true
	private stopScheduled = false

	constructor(note: string, settings: NoteInstanceSettingsT, audioContext: AudioContext, audioBuffer: AudioBuffer) {
		this.name = note
		this.settings = settings
		this.audioContext = audioContext

		// Create audio nodes
		this.gainNode = audioContext.createGain()
		this.panNode = audioContext.createStereoPanner()

		// Connect nodes
		this.gainNode.connect(this.panNode)
		this.panNode.connect(audioContext.destination)

		// Apply initial settings
		this.gainNode.gain.value = numbers.toNumber(settings.gain) || 1
		this.panNode.pan.value = numbers.toNumber(settings.pan) || 0

		this.playAudio(audioBuffer)
	}

	private playAudio(audioBuffer: AudioBuffer) {
		if (!this.isActive) return

		this.sourceNode = this.audioContext.createBufferSource()
		this.sourceNode.buffer = audioBuffer

		// Apply detune
		if (this.settings.detune) {
			this.sourceNode.detune.value = this.settings.detune
		}

		// Connect to gain node
		this.sourceNode.connect(this.gainNode)

		// Handle attack and release
		const now = this.audioContext.currentTime
		const attackTime = (this.settings.attack || 0) / 1000
		const releaseTime = (this.settings.release || 0) / 1000
		const duration = (this.settings.duration || 1000) / 1000

		// Attack envelope
		if (attackTime > 0) {
			this.gainNode.gain.setValueAtTime(0, now)
			this.gainNode.gain.linearRampToValueAtTime(this.settings.gain || 1, now + attackTime)
		}

		// Release envelope
		if (releaseTime > 0 && duration > attackTime) {
			const releaseStart = now + duration - releaseTime
			this.gainNode.gain.setValueAtTime(this.settings.gain || 1, releaseStart)
			this.gainNode.gain.linearRampToValueAtTime(0, now + duration)
		}

		// Schedule stop
		this.sourceNode.start(now + (this.settings.after || 0) / 1000)
		this.sourceNode.stop(now + (this.settings.after || 0) / 1000 + duration)

		// Clean up when finished
		this.sourceNode.onended = () => {
			this.isActive = false
		}
	}

	after = (milliseconds: number) => {
		if (!this.isActive) return this
		// For already playing notes, this would schedule a parameter change
		return this
	}

	duration = (milliseconds: number) => {
		if (!this.isActive) return this
		// For already playing notes, this would reschedule the stop time
		return this
	}

	gain = (gain: number) => {
		if (!this.isActive) return this
		const now = this.audioContext.currentTime
		this.gainNode.gain.setTargetAtTime(gain, now, 0.1)
		return this
	}

	pan = (pan: number) => {
		if (!this.isActive) return this
		const now = this.audioContext.currentTime
		this.panNode.pan.setTargetAtTime(pan, now, 0.1)
		return this
	}

	play = () => {
		// For restarting a stopped note, we'd need to recreate the audio nodes
		return this
	}

	stop = () => {
		if (!this.isActive || this.stopScheduled) return

		this.stopScheduled = true
		const now = this.audioContext.currentTime

		// Quick fade out to avoid clicks
		this.gainNode.gain.setTargetAtTime(0, now, 0.05)

		// Stop the source after fade
		setTimeout(() => {
			if (this.sourceNode) {
				try {
					this.sourceNode.stop()
				} catch (e) {
					// Already stopped
				}
			}
			this.isActive = false
		}, 100)
	}

	get isPlaying() {
		return this.isActive && !this.stopScheduled
	}
}
