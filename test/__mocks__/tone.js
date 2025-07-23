// __mocks__/tone.js
const createMockParam = (val = 0) => ({
  value: val,
  rampTo: jest.fn(),
  linearRampTo: jest.fn(),
  exponentialRampTo: jest.fn(),
  setValueAtTime: jest.fn(),
  cancelScheduledValues: jest.fn()
})

class MockGain {
  constructor(value = 0.7) {
    this.gain = createMockParam(value)
    this.connect = jest.fn(() => this)
    this.toDestination = jest.fn(() => this)
    this.dispose = jest.fn()
  }
}

class MockSynth {
  constructor(options = {}) {
    this.options = options
    this.volume = createMockParam(-12)
    this.frequency = createMockParam(440)
    this.triggerAttack = jest.fn()
    this.triggerRelease = jest.fn()
    this.triggerAttackRelease = jest.fn()
    this.toDestination = jest.fn(() => this)
    this.connect = jest.fn(() => this)
    this.dispose = jest.fn()
  }
}

module.exports = {
  getContext: () => ({
    state: 'running',
    currentTime: 0,
    rawContext: new AudioContext(),
    resume: jest.fn(() => Promise.resolve())
  }),
  context: {
    state: 'running',
    currentTime: 0,
    resume: jest.fn(() => Promise.resolve())
  },
  now: () => Date.now() / 1000,
  start: () => Promise.resolve(),
  Frequency: (note) => ({
    toMidi: () => 60,
    toNote: () => note,
    toFrequency: () => 440
  }),
  Gain: MockGain,
  Synth: MockSynth,
  gainToDb: (g) => Math.log10(g) * 20,
  dbToGain: (db) => Math.pow(10, db / 20)
}
