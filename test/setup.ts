// Test setup for Bun test runner
// This file ensures AudioContext is properly mocked before any imports

// Try using audio-context-mock instead
import 'audio-context-mock'

// Mock performance API
globalThis.performance = globalThis.performance || { now: () => Date.now() }

// Mock fetch for soundfont loading
globalThis.fetch = globalThis.fetch || (() => 
  Promise.resolve({
    ok: true,
    status: 200,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
  })
) as any

console.log('[Test Setup] AudioContext mocked for test environment')