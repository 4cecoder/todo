#!/usr/bin/env node

/**
 * Production Build Script
 *
 * This script optimizes build process for Vercel/production environments
 * by completely skipping Playwright-related operations and dependencies.
 */

import { execSync } from 'child_process'

console.log('🚀 Starting optimized production build...')

// Set environment variables for production build
process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1'
process.env.PLAYWRIGHT_BROWSERS_PATH = '0'
process.env.CI = 'true'
process.env.NODE_ENV = 'production'
process.env.NEXT_TELEMETRY_DISABLED = '1'

try {
  console.log('📦 Installing dependencies without scripts...')
  execSync('npm ci --ignore-scripts', { stdio: 'inherit' })

  console.log('🔧 Building Next.js application...')
  execSync('npm run build', { stdio: 'inherit' })

  console.log('✅ Production build completed successfully!')
  console.log('📊 Build optimizations applied:')
  console.log('   - Skipped Playwright browser downloads')
  console.log('   - Disabled postinstall scripts')
  console.log('   - Optimized for Vercel deployment')
} catch (error) {
  console.error('❌ Production build failed:', error.message)
  process.exit(1)
}
