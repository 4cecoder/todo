import { DatabaseHelper } from '../database-helper'

export async function setupTestUsers() {
  console.log('👤 Setting up test users...')

  const dbHelper = new DatabaseHelper()

  // Create test users in the database
  const testUsers = [
    {
      clerkId: 'test-user-1',
      email: 'test1@example.com',
      name: 'Test User 1'
    },
    {
      clerkId: 'test-user-2',
      email: 'test2@example.com',
      name: 'Test User 2'
    }
  ]

  for (const user of testUsers) {
    try {
      await dbHelper.createTestUser(user.clerkId, user.email, user.name)
      console.log(`✅ Created test user: ${user.email}`)
    } catch (error) {
      console.log(`⚠️  Test user ${user.email} may already exist`)
    }
  }

  console.log('✅ Test users setup complete')
}

export async function cleanupTestUsers() {
  console.log('🧹 Cleaning up test users...')

  const dbHelper = new DatabaseHelper()

  const testUserIds = ['test-user-1', 'test-user-2']

  for (const userId of testUserIds) {
    try {
      await dbHelper.deleteTestData(userId)
      console.log(`✅ Cleaned up test user: ${userId}`)
    } catch (error) {
      console.log(`⚠️  Failed to cleanup test user: ${userId}`)
    }
  }

  console.log('✅ Test users cleanup complete')
}