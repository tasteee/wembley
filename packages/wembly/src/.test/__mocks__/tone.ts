// Mock for Tone.js in test environment
export class MockSynth {
	volume = {
		rampTo: jest.fn(),
		value: 0
	}

	frequency = {
		rampTo: jest.fn(),
		value: 440
	}

	detune = {
		rampTo: jest.fn(),
		value: 0
	}

	triggerAttackRelease = jest.fn()
	triggerAttack = jest.fn()
	triggerRelease = jest.fn()
	dispose = jest.fn()

	constructor(options?: any) {
		// Mock constructor
	}
}

export class MockPanner {
	pan = {
		rampTo: jest.fn(),
		value: 0
	}

	connect = jest.fn().mockReturnThis()
	dispose = jest.fn()

	constructor() {
		// Mock constructor
	}
}

export class MockDestination {
	static connect = jest.fn()
}

export class MockTransport {
	static start = jest.fn()
	static stop = jest.fn()
	static cancel = jest.fn()
	static scheduleOnce = jest.fn()
}

export class MockContext {
	static state = 'running'
	static resume = jest.fn().mockResolvedValue(undefined)
	static suspend = jest.fn().mockResolvedValue(undefined)
}

// Mock the main Tone object
export const Tone = {
	Synth: MockSynth,
	Panner: MockPanner,
	Destination: MockDestination,
	Transport: MockTransport,
	Context: MockContext,
	context: MockContext,
	start: jest.fn().mockResolvedValue(undefined),
	getDestination: jest.fn().mockReturnValue(MockDestination)
}

export default Tone

// Named exports for individual classes
export const Synth = MockSynth
export const Panner = MockPanner
export const Destination = MockDestination
export const Transport = MockTransport
export const Context = MockContext
