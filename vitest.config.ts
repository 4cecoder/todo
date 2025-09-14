import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup/setup.ts'],
    include: ['**/tests/unit/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.next', 'tests/e2e', 'coverage', 'build'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'json'],
      exclude: [
        'node_modules/',
        'tests/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/setup.{js,ts}',
        '**/build/**',
        '**/.next/**',
        '**/dist/**',
      ],
      include: [
        'app/**/*.{js,jsx,ts,tsx}',
        'components/**/*.{js,jsx,ts,tsx}',
        'lib/**/*.{js,jsx,ts,tsx}',
      ],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
      },
    },
    isolate: true,
    hookTimeout: 10000,
    testTimeout: 10000,
    // HMR configuration removed - not supported in current Vitest version
    onConsoleLog(log) {
      return !log.includes('Running connection diagnostics')
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/app': path.resolve(__dirname, './app'),
      '@/tests': path.resolve(__dirname, './tests'),
    },
  },
  define: {
    global: 'globalThis',
  },
  server: {
    // Server configuration
  },
})
