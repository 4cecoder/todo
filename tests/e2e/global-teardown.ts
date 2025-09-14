import { cleanupTestUsers } from './utils/test-users'
import { teardownTestDatabase } from './utils/test-database'

async function globalTeardown() {
  console.log('🧹 Tearing down test environment...')

  // Cleanup test users
  await cleanupTestUsers()

  // Teardown test database
  await teardownTestDatabase()

  console.log('✅ Test environment teardown complete')
}

export default globalTeardown