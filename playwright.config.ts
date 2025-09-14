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

  // Skip browser download in production/Vercel environment
  // Browsers are only installed when PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD is not "1"

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

  // Configure projects for Firefox only (excludes Chrome/WebKit for Vercel compatibility)
  projects: [
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // Firefox-specific settings for better CI/CD compatibility
        launchOptions: {
          firefoxUserPrefs: {
            'dom.webnotifications.enabled': false,
            'dom.push.enabled': false,
          },
        },
      },
    },
    // Mobile testing with Firefox
    {
      name: 'Mobile Firefox',
      use: {
        ...devices['Pixel 5'],
        // Firefox mobile settings
        launchOptions: {
          firefoxUserPrefs: {
            'dom.webnotifications.enabled': false,
            'dom.push.enabled': false,
          },
        },
      },
    },
  ],

  // Web server configuration - only for local development and CI
  webServer:
    process.env['CI'] || process.env['PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD'] === '1'
      ? undefined // Skip web server in CI/Vercel
      : {
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
    browser: 'Firefox-only for Vercel compatibility',
  },
})
