import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  snapshotDir: './tests/e2e/snapshots',

  // Global test configuration
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,

  // Timeout configuration
  timeout: 30 * 1000, // 30 seconds
  expect: {
    timeout: 10 * 1000, // 10 seconds
  },

  // Reporter configuration
  reporter: process.env['CI']
    ? [['github'], ['html'], ['json', { outputFile: 'test-results/results.json' }]]
    : [['html'], ['list']],

  // Global setup and teardown
  globalSetup: require.resolve('./tests/e2e/global-setup'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown'),

  // Shared settings for all tests
  use: {
    baseURL: process.env['BASE_URL'] || 'http://localhost:3000',
    trace: process.env['CI'] ? 'retain-on-failure' : 'on-first-retry',
    screenshot: process.env['CI'] ? 'only-on-failure' : 'on',
    video: process.env['CI'] ? 'retain-on-failure' : 'off',
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,

    // Test isolation
    storageState: undefined, // We'll handle auth state per test

    // Environment variables
    extraHTTPHeaders: {
      'x-test-environment': 'true',
    },

    // Browser context settings
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    bypassCSP: true,
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // Mobile testing
    {
      name: 'Mobile Firefox',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Web server configuration
  webServer: {
    command: 'npm run dev',
    url: process.env['BASE_URL'] || 'http://localhost:3000',
    reuseExistingServer: !process.env['CI'],
    timeout: 120 * 1000, // 2 minutes
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_CONVEX_URL: process.env['NEXT_PUBLIC_CONVEX_URL'] || '',
      CLERK_PUBLISHABLE_KEY: process.env['CLERK_PUBLISHABLE_KEY'] || '',
      CLERK_SECRET_KEY: process.env['CLERK_SECRET_KEY'] || '',
    },
  },

  // Test metadata
  metadata: {
    project: 'ByteCats Todo App',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
})
