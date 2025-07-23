module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '.*\\.spec\\.ts$', // Ignore Playwright spec files
    'browser\\.spec\\.ts$'    // Specifically ignore browser tests
  ],
  // Remove invalid beforeAll option
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^tone$': '<rootDir>/test/__mocks__/tone.ts'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
}