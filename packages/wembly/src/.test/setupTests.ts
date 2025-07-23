import { AudioBuffer, AudioContext, registrar } from 'standardized-audio-context-mock'

window.AudioBuffer = AudioBuffer
window.AudioContext = AudioContext
jest.mock('tone')
