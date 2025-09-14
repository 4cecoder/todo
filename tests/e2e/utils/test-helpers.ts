/**
 * Test helper utilities for authentication and user management
 */

export function generateTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}-${timestamp}-${random}@example.com`
}

export function generateTestPassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''

  // Ensure at least one uppercase, one lowercase, one number, and one special character
  password += 'A' // uppercase
  password += 'a' // lowercase
  password += '1' // number
  password += '!' // special

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

export function generateTestName(): string {
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]

  return `${firstName} ${lastName}`
}

export function generateTestTodoTitle(): string {
  const adjectives = ['Important', 'Urgent', 'Quick', 'Daily', 'Weekly', 'Monthly']
  const nouns = ['Meeting', 'Review', 'Task', 'Project', 'Update', 'Check']

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const timestamp = Date.now()

  return `${adjective} ${noun} ${timestamp}`
}

export function generateTestCategoryName(): string {
  const categories = ['Work', 'Personal', 'Shopping', 'Health', 'Education', 'Travel', 'Finance']
  const random = Math.random().toString(36).substring(2, 6)

  const category = categories[Math.floor(Math.random() * categories.length)]
  return `${category} ${random}`
}

export function getRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Wait for a specific amount of time
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate a random OTP code for testing
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Clean up test data by pattern
 */
export function cleanupTestData(testIdentifier: string): void {
  // This would be used to clean up test-specific data
  console.log(`Cleaning up test data for: ${testIdentifier}`)
}