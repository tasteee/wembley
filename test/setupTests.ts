import { AudioBuffer, AudioContext, registrar } from 'standardized-audio-context-mock'

// @ts-ignore
window.AudioBuffer = AudioBuffer
// @ts-ignore
window.AudioContext = AudioContext

jest.mock('tone')
