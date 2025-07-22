// Mock Tone.js for testing - this is only for the test environment
// The actual application will use real Tone.js
global.window = {}
global.performance = { now: () => Date.now() }

// Mock Web Audio API
global.AudioContext = class MockAudioContext {
  constructor() {
    this.state = 'running'
    this.destination = { connect: () => {} }
    this.currentTime = 0
  }
  createGain() {
    return {
      gain: { value: 0.7 },
      connect: () => {},
      disconnect: () => {}
    }
  }
  resume() { return Promise.resolve() }
}

// Mock Tone.js completely for tests
jest.mock('tone', () => ({
  getContext: () => ({ 
    state: 'running',
    currentTime: 0,
    rawContext: new global.AudioContext()
  }),
  start: () => Promise.resolve(),
  now: () => Date.now() / 1000,
  Gain: class MockGain {
    constructor(value) { this.value = value }
    connect() { return this }
    toDestination() { return this }
    dispose() { console.log(`[Mock] disposing gain`) }
  },
  Synth: class MockSynth {
    constructor(options) { this.options = options }
    connect() { return this }
    triggerAttack(note, time) { console.log(`[Mock] triggerAttack: ${note} at ${time}`) }
    triggerAttackRelease(note, duration, time) { console.log(`[Mock] triggerAttackRelease: ${note} for ${duration}s at ${time}`) }
    triggerRelease(time) { console.log(`[Mock] triggerRelease at ${time}`) }
    dispose() { console.log(`[Mock] disposing synth`) }
  },
  Panner: class MockPanner {
    constructor(pan) { this.pan = pan }
    connect() { return this }
    dispose() { console.log(`[Mock] disposing panner`) }
  },
  ToneAudioBuffer: class MockToneAudioBuffer {
    constructor() {}
  },
  Player: class MockPlayer {
    constructor() {}
    connect() { return this }
    start() { console.log(`[Mock] player start`) }
    stop() { console.log(`[Mock] player stop`) }
    dispose() { console.log(`[Mock] disposing player`) }
  }
}))

module.exports = {}