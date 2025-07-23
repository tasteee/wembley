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

// Mock fetch for soundfont loading
global.fetch = jest.fn(() =>
  Promise.resolve({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
  })
)

// Mock the soundfont parser
jest.mock('@marmooo/soundfont-parser', () => ({
  parse: () => ({ 
    header: { fileType: 'RIFF' },
    presets: [],
    instruments: [],
    samples: []
  }),
  SoundFont: class MockSoundFont {
    constructor(data) {
      this.data = data
    }
  }
}))

// Mock Tone.js completely for tests
jest.mock('tone', () => {
  const createMockParam = (initialValue = 0) => ({
    value: initialValue,
    rampTo: jest.fn(),
    linearRampTo: jest.fn(),
    exponentialRampTo: jest.fn(),
    setValueAtTime: jest.fn(),
    cancelScheduledValues: jest.fn()
  })

  return {
    getContext: () => ({ 
      state: 'running',
      currentTime: 0,
      rawContext: new global.AudioContext(),
      resume: () => Promise.resolve()
    }),
    start: () => Promise.resolve(),
    now: () => Date.now() / 1000,
    context: {
      state: 'running',
      currentTime: 0,
      resume: () => Promise.resolve()
    },
    Frequency: (value, units) => {
      // Simple mock implementation for converting notes to MIDI
      const noteToMidi = {
        'C0': 12, 'C#0': 13, 'D0': 14, 'D#0': 15, 'E0': 16, 'F0': 17, 'F#0': 18, 'G0': 19, 'G#0': 20, 'A0': 21, 'A#0': 22, 'B0': 23,
        'C1': 24, 'C#1': 25, 'D1': 26, 'D#1': 27, 'E1': 28, 'F1': 29, 'F#1': 30, 'G1': 31, 'G#1': 32, 'A1': 33, 'A#1': 34, 'B1': 35,
        'C2': 36, 'C#2': 37, 'D2': 38, 'D#2': 39, 'E2': 40, 'F2': 41, 'F#2': 42, 'G2': 43, 'G#2': 44, 'A2': 45, 'A#2': 46, 'B2': 47,
        'C3': 48, 'C#3': 49, 'D3': 50, 'D#3': 51, 'E3': 52, 'F3': 53, 'F#3': 54, 'G3': 55, 'G#3': 56, 'A3': 57, 'A#3': 58, 'B3': 59,
        'C4': 60, 'C#4': 61, 'D4': 62, 'D#4': 63, 'E4': 64, 'F4': 65, 'F#4': 66, 'G4': 67, 'G#4': 68, 'A4': 69, 'A#4': 70, 'B4': 71,
        'C5': 72, 'C#5': 73, 'D5': 74, 'D#5': 75, 'E5': 76, 'F5': 77, 'F#5': 78, 'G5': 79, 'G#5': 80, 'A5': 81, 'A#5': 82, 'B5': 83
      }
      
      return {
        toMidi: () => noteToMidi[value] || 60,
        toNote: () => value,
        toFrequency: () => 440
      }
    },
    Gain: class MockGain {
      constructor(value = 0.7) { 
        this.gain = createMockParam(value)
        this.volume = createMockParam(0)
      }
      connect() { return this }
      toDestination() { return this }
      dispose() { console.log(`[Mock] disposing gain`) }
    },
    Synth: class MockSynth {
      constructor(options = {}) { 
        this.options = options
        this.volume = createMockParam(-12) // Default Tone.js volume in dB
        this.detune = createMockParam(0)
        this.frequency = createMockParam(440)
      }
      connect() { return this }
      toDestination() { return this }
      triggerAttack(note, time) { console.log(`[Mock] triggerAttack: ${note} at ${time}`) }
      triggerAttackRelease(note, duration, time) { console.log(`[Mock] triggerAttackRelease: ${note} for ${duration}s at ${time}`) }
      triggerRelease(time) { console.log(`[Mock] triggerRelease at ${time}`) }
      dispose() { console.log(`[Mock] disposing synth`) }
    },
    Panner: class MockPanner {
      constructor(pan = 0) { 
        this.pan = createMockParam(pan)
      }
      connect() { return this }
      dispose() { console.log(`[Mock] disposing panner`) }
    },
    ToneAudioBuffer: class MockToneAudioBuffer {
      constructor() {}
    },
    Player: class MockPlayer {
      constructor() {
        this.volume = createMockParam(-12)
      }
      connect() { return this }
      start() { console.log(`[Mock] player start`) }
      stop() { console.log(`[Mock] player stop`) }
      dispose() { console.log(`[Mock] disposing player`) }
    },
    gainToDb: (gain) => Math.log10(gain) * 20,
    dbToGain: (db) => Math.pow(10, db / 20)
  }
})

module.exports = {}