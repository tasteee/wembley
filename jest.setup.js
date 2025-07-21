// Mock Tone.js for testing
global.window = {}
global.performance = { now: () => Date.now() }

// Mock Web Audio API
global.AudioContext = class MockAudioContext {}