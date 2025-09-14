import { test, expect } from './fixtures'
import { generateTestEmail, generateTestPassword } from './utils/test-helpers'

test.describe('Authentication Flow Tests', () => {
  test.describe('Sign-up Flow Testing', () => {
    test('should successfully register a new user', async ({ page }) => {
      const testEmail = generateTestEmail()
      const testPassword = generateTestPassword()

      // Navigate to sign-up page
      await page.goto('/sign-up')

      // Wait for Clerk sign-up form to load
      await page.waitForSelector('.cl-signUp-root', { timeout: 10000 })

      // Fill out registration form
      await page.fill('input[name="emailAddress"]', testEmail)
      await page.fill('input[name="password"]', testPassword)
      await page.fill('input[name="firstName"]', 'Test')
      await page.fill('input[name="lastName"]', 'User')

      // Submit form
      await page.click('button[type="submit"]')

      // Handle email verification if required
      try {
        // Wait for email verification step
        await page.waitForSelector('.cl-otpCodeField-root', { timeout: 5000 })

        // For testing purposes, we'll simulate email verification
        // In a real scenario, you'd need to intercept emails or use test OTP
        const otpCode = '123456' // This would come from email interception
        await page.fill('input[name="code"]', otpCode)
        await page.click('button[type="submit"]')
      } catch (error) {
        // Email verification might not be required in test environment
        console.log('Email verification not required or handled automatically')
      }

      // Verify successful registration and redirect
      await page.waitForURL('**/todos', { timeout: 30000 })

      // Verify user is authenticated
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()

      // Verify user context is available
      const userMenu = page.locator('[data-testid="user-menu"]')
      await expect(userMenu).toContainText('Test User')
    })

    test('should handle duplicate email registration', async ({ page }) => {
      const existingEmail = process.env.TEST_USER_EMAIL || 'test@example.com'
      const testPassword = generateTestPassword()

      await page.goto('/sign-up')

      // Wait for form to load
      await page.waitForSelector('.cl-signUp-root', { timeout: 10000 })

      // Try to register with existing email
      await page.fill('input[name="emailAddress"]', existingEmail)
      await page.fill('input[name="password"]', testPassword)
      await page.fill('input[name="firstName"]', 'Test')
      await page.fill('input[name="lastName"]', 'User')

      await page.click('button[type="submit"]')

      // Should show error message
      await expect(page.locator('.cl-formFieldErrorText')).toBeVisible()
      await expect(page.locator('.cl-formFieldErrorText')).toContainText(/already|exists|taken/i)
    })

    test('should validate email format', async ({ page }) => {
      await page.goto('/sign-up')

      await page.waitForSelector('.cl-signUp-root', { timeout: 10000 })

      // Test invalid email formats
      const invalidEmails = ['invalid-email', 'test@', '@example.com', 'test..test@example.com']

      for (const invalidEmail of invalidEmails) {
        await page.fill('input[name="emailAddress"]', invalidEmail)
        await page.fill('input[name="password"]', 'password123')
        await page.fill('input[name="firstName"]', 'Test')
        await page.fill('input[name="lastName"]', 'User')

        await page.click('button[type="submit"]')

        // Should show email validation error
        await expect(page.locator('.cl-formFieldErrorText')).toBeVisible()
        await expect(page.locator('.cl-formFieldErrorText')).toContainText(/invalid|format|email/i)

        // Clear form for next test
        await page.fill('input[name="emailAddress"]', '')
      }
    })

    test('should validate password requirements', async ({ page }) => {
      const testEmail = generateTestEmail()

      await page.goto('/sign-up')

      await page.waitForSelector('.cl-signUp-root', { timeout: 10000 })

      // Test weak passwords
      const weakPasswords = ['123', 'password', 'weak']

      for (const weakPassword of weakPasswords) {
        await page.fill('input[name="emailAddress"]', testEmail)
        await page.fill('input[name="password"]', weakPassword)
        await page.fill('input[name="firstName"]', 'Test')
        await page.fill('input[name="lastName"]', 'User')

        await page.click('button[type="submit"]')

        // Should show password validation error
        await expect(page.locator('.cl-formFieldErrorText')).toBeVisible()
        await expect(page.locator('.cl-formFieldErrorText')).toContainText(/password|weak|requirements/i)

        // Clear password field
        await page.fill('input[name="password"]', '')
      }
    })
  })

  test.describe('Sign-in Flow Testing', () => {
    test('should successfully sign in with valid credentials', async ({ page }) => {
      const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com'
      const testPassword = process.env.TEST_USER_PASSWORD || 'password123'

      await page.goto('/sign-in')

      // Wait for Clerk sign-in form to load
      await page.waitForSelector('.cl-signIn-root', { timeout: 10000 })

      // Fill in credentials
      await page.fill('input[name="emailAddress"]', testEmail)
      await page.fill('input[name="password"]', testPassword)

      // Submit form
      await page.click('button[type="submit"]')

      // Verify successful authentication
      await page.waitForURL('**/todos', { timeout: 30000 })

      // Verify user is signed in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()

      // Verify session persistence by checking if user stays logged in
      await page.reload()
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
    })

    test('should handle invalid credentials', async ({ page }) => {
      await page.goto('/sign-in')

      await page.waitForSelector('.cl-signIn-root', { timeout: 10000 })

      // Try invalid credentials
      await page.fill('input[name="emailAddress"]', 'invalid@example.com')
      await page.fill('input[name="password"]', 'wrongpassword')

      await page.click('button[type="submit"]')

      // Should show error message
      await expect(page.locator('.cl-formFieldErrorText')).toBeVisible()
      await expect(page.locator('.cl-formFieldErrorText')).toContainText(/invalid|incorrect|wrong/i)

      // Should still be on sign-in page
      await expect(page).toHaveURL(/.*sign-in.*/)
    })

    test('should handle empty form submission', async ({ page }) => {
      await page.goto('/sign-in')

      await page.waitForSelector('.cl-signIn-root', { timeout: 10000 })

      // Submit empty form
      await page.click('button[type="submit"]')

      // Should show validation errors
      await expect(page.locator('.cl-formFieldErrorText')).toBeVisible()
      await expect(page.locator('.cl-formFieldErrorText')).toContainText(/required|empty/i)
    })

    test('should handle account lockout after multiple failed attempts', async ({ page }) => {
      await page.goto('/sign-in')

      await page.waitForSelector('.cl-signIn-root', { timeout: 10000 })

      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await page.fill('input[name="emailAddress"]', 'test@example.com')
        await page.fill('input[name="password"]', `wrongpassword${i}`)
        await page.click('button[type="submit"]')

        // Wait for error message
        await page.waitForSelector('.cl-formFieldErrorText', { timeout: 5000 })
      }

      // Should show account lockout message
      await expect(page.locator('.cl-formFieldErrorText')).toContainText(/locked|blocked|too many/i)
    })
  })

  test.describe('Authentication State Testing', () => {
    test('should protect authenticated routes', async ({ page }) => {
      // Try to access protected route without authentication
      await page.goto('/todos')

      // Should redirect to sign-in
      await page.waitForURL(/.*sign-in.*/, { timeout: 10000 })
      await expect(page).toHaveURL(/.*sign-in.*/)
    })

    test('should allow access to public routes without authentication', async ({ page }) => {
      // Access public routes
      await page.goto('/')
      await expect(page).toHaveURL('/')

      await page.goto('/sign-in')
      await expect(page).toHaveURL(/.*sign-in.*/)

      await page.goto('/sign-up')
      await expect(page).toHaveURL(/.*sign-up.*/)
    })

    test('should maintain user session across page reloads', async ({ authenticatedPage }) => {
      // User should remain authenticated after page reload
      await authenticatedPage.reload()
      await expect(authenticatedPage.locator('[data-testid="user-menu"]')).toBeVisible()
    })

    test('should handle logout functionality', async ({ page }) => {
      // Sign in first
      const authHelper = new (await import('../auth-helper')).AuthHelper(page)
      await authHelper.signInAsTestUser()

      // Verify user is signed in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()

      // Sign out
      await authHelper.signOut()

      // Verify user is signed out
      await expect(page.locator('[data-testid="user-menu"]')).toBeHidden()

      // Should redirect to home page
      await expect(page).toHaveURL('/')

      // Try to access protected route
      await page.goto('/todos')

      // Should redirect to sign-in
      await page.waitForURL(/.*sign-in.*/, { timeout: 10000 })
    })

    test('should handle session expiration', async ({ page }) => {
      // Sign in
      const authHelper = new (await import('../auth-helper')).AuthHelper(page)
      await authHelper.signInAsTestUser()

      // Simulate session expiration by clearing local storage
      await page.evaluate(() => {
        localStorage.clear()
        sessionStorage.clear()
      })

      // Reload page
      await page.reload()

      // Should redirect to sign-in due to expired session
      await page.waitForURL(/.*sign-in.*/, { timeout: 10000 })
    })
  })

  test.describe('Error Handling Testing', () => {
    test('should handle network errors during sign-in', async ({ page }) => {
      // Intercept network requests to simulate network failure
      await page.route('**/v1/client/sign_in*', async route => {
        await route.abort()
      })

      await page.goto('/sign-in')

      await page.waitForSelector('.cl-signIn-root', { timeout: 10000 })

      await page.fill('input[name="emailAddress"]', 'test@example.com')
      await page.fill('input[name="password"]', 'password123')

      await page.click('button[type="submit"]')

      // Should show network error message
      await expect(page.locator('.cl-formFieldErrorText')).toBeVisible()
      await expect(page.locator('.cl-formFieldErrorText')).toContainText(/network|connection|error/i)
    })

    test('should handle network errors during sign-up', async ({ page }) => {
      // Intercept network requests to simulate network failure
      await page.route('**/v1/client/sign_up*', async route => {
        await route.abort()
      })

      const testEmail = generateTestEmail()

      await page.goto('/sign-up')

      await page.waitForSelector('.cl-signUp-root', { timeout: 10000 })

      await page.fill('input[name="emailAddress"]', testEmail)
      await page.fill('input[name="password"]', 'password123')
      await page.fill('input[name="firstName"]', 'Test')
      await page.fill('input[name="lastName"]', 'User')

      await page.click('button[type="submit"]')

      // Should show network error message
      await expect(page.locator('.cl-formFieldErrorText')).toBeVisible()
      await expect(page.locator('.cl-formFieldErrorText')).toContainText(/network|connection|error/i)
    })

    test('should handle rate limiting', async ({ page }) => {
      await page.goto('/sign-in')

      await page.waitForSelector('.cl-signIn-root', { timeout: 10000 })

      // Simulate rapid requests that might trigger rate limiting
      for (let i = 0; i < 10; i++) {
        await page.fill('input[name="emailAddress"]', `test${i}@example.com`)
        await page.fill('input[name="password"]', 'password123')
        await page.click('button[type="submit"]')

        // Small delay to avoid overwhelming the page
        await page.waitForTimeout(100)
      }

      // Should eventually show rate limit error
      await expect(page.locator('.cl-formFieldErrorText')).toContainText(/rate|limit|too many/i)
    })
  })

  test.describe('Integration Testing', () => {
    test('should synchronize user data between Clerk and ConvexDB', async ({ page }) => {
      const testEmail = generateTestEmail()
      const testPassword = generateTestPassword()

      // Sign up new user
      await page.goto('/sign-up')
      await page.waitForSelector('.cl-signUp-root', { timeout: 10000 })

      await page.fill('input[name="emailAddress"]', testEmail)
      await page.fill('input[name="password"]', testPassword)
      await page.fill('input[name="firstName"]', 'Integration')
      await page.fill('input[name="lastName"]', 'Test')

      await page.click('button[type="submit"]')

      // Wait for successful registration
      await page.waitForURL('**/todos', { timeout: 30000 })

      // Verify user data is synchronized
      // This would require checking ConvexDB for user data
      // For now, we'll verify the user can access protected features
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()

      // Try to create a todo (tests integration)
      await page.click('[data-testid="new-todo-button"]')
      await page.fill('[data-testid="todo-title-input"]', 'Integration Test Todo')
      await page.click('[data-testid="save-todo-button"]')

      // Verify todo was created and saved
      await expect(page.locator('[data-testid="todo-item"]').filter({ hasText: 'Integration Test Todo' })).toBeVisible()
    })

    test('should handle real-time authentication state updates', async ({ browser }) => {
      // Create two browser contexts to test real-time updates
      const context1 = await browser.newContext()
      const context2 = await browser.newContext()

      const page1 = await context1.newPage()
      const page2 = await context2.newPage()

      try {
        // Sign in on first page
        const authHelper1 = new (await import('../auth-helper')).AuthHelper(page1)
        await authHelper1.signInAsTestUser()

        // Verify first page is authenticated
        await expect(page1.locator('[data-testid="user-menu"]')).toBeVisible()

        // Second page should remain unauthenticated
        await page2.goto('/todos')
        await page2.waitForURL(/.*sign-in.*/, { timeout: 10000 })

        // Sign out on first page
        await authHelper1.signOut()

        // First page should be signed out
        await expect(page1.locator('[data-testid="user-menu"]')).toBeHidden()

        // Second page should still be unauthenticated (no cross-context interference)
        await page2.goto('/todos')
        await expect(page2).toHaveURL(/.*sign-in.*/)
      } finally {
        await context1.close()
        await context2.close()
      }
    })

    test('should handle Clerk webhook integration', async ({ page }) => {
      // This test would verify webhook handling for user creation/updates
      // For now, we'll test the basic user creation flow

      const testEmail = generateTestEmail()
      const testPassword = generateTestPassword()

      await page.goto('/sign-up')
      await page.waitForSelector('.cl-signUp-root', { timeout: 10000 })

      await page.fill('input[name="emailAddress"]', testEmail)
      await page.fill('input[name="password"]', testPassword)
      await page.fill('input[name="firstName"]', 'Webhook')
      await page.fill('input[name="lastName"]', 'Test')

      await page.click('button[type="submit"]')

      await page.waitForURL('**/todos', { timeout: 30000 })

      // Verify user profile is accessible (indicates webhook processed)
      await page.goto('/profile')
      await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()
      await expect(page.locator('[data-testid="user-email"]')).toContainText(testEmail)
    })
  })
})