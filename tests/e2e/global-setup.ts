import { setupTestDatabase } from './utils/test-database'
import { setupTestUsers } from './utils/test-users'

async function globalSetup() {
  console.log('🚀 Setting up test environment...')

  try {
    // Setup test database
    await setupTestDatabase()

    // Setup test users
    await setupTestUsers()

    // Install Playwright browsers if needed
    if (process.env.CI) {
      console.log('📦 Installing Playwright browsers...')
      const { execSync } = require('child_process')
      execSync('npx playwright install --with-deps', { stdio: 'inherit' })
    }

    console.log('✅ Test environment setup complete')
  } catch (error) {
    console.error('❌ Test environment setup failed:', error)
    throw error
  }
}

export default globalSetup