import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig: Config = {
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup/setup.ts'],

  // Test environment
  testEnvironment: 'jsdom',

  // Module mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/tests/(.*)$': '<rootDir>/tests/$1',
  },

  // Coverage configuration
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!**/.next/**',
    '!**/build/**',
    '!**/dist/**',
  ],

  // Test matching patterns
  testMatch: [
    '**/tests/unit/**/*.test.{js,jsx,ts,tsx}',
    '**/tests/unit/**/*.spec.{js,jsx,ts,tsx}',
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
  ],

  // Coverage reporting
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },

  // Global setup and teardown
  globalSetup: '<rootDir>/tests/setup/global-setup.ts',
  globalTeardown: '<rootDir>/tests/setup/global-teardown.ts',

  // Timeout configuration
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Cache directory
  cacheDirectory: '<rootDir>/.jest',

  // Clear mocks before each test
  clearMocks: true,

  // Reset mocks before each test
  resetMocks: true,

  // Restore mocks before each test
  restoreMocks: true,

  // Collect coverage from all files
  collectCoverage: true,

  // Watch plugins
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],

  // Max workers
  maxWorkers: '50%',

  // Detect open handles
  detectOpenHandles: true,

  // Detect leaks
  detectLeaks: true,

  // Error on deprecated
  errorOnDeprecated: true,

  // Force exit
  forceExit: true,

  // Pass with no tests
  passWithNoTests: true,

  // Setup files
  setupFiles: ['<rootDir>/tests/setup/polyfills.js'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig)
