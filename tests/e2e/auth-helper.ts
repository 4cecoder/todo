import { Page } from '@playwright/test'

export class AuthHelper {
  private page: Page

  constructor(page: Page) {
    this.page = page
  }

  async signInAsTestUser(email?: string, password?: string) {
    const testEmail = email || process.env.TEST_USER_EMAIL || 'test@example.com'
    const testPassword = password || process.env.TEST_USER_PASSWORD || 'password123'

    // Navigate to sign in page
    await this.page.goto('/sign-in')

    // Wait for Clerk sign-in form to load
    await this.page.waitForSelector('[data-testid="sign-in-form"]', { timeout: 10000 })

    // Fill in credentials
    await this.page.fill('[name="email"]', testEmail)
    await this.page.fill('[name="password"]', testPassword)

    // Submit form
    await this.page.click('[data-testid="sign-in-submit"]')

    // Wait for successful sign in
    await this.page.waitForURL('**/todos', { timeout: 30000 })

    // Verify we're signed in
    await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 10000 })
  }

  async signUpAsTestUser(email?: string, password?: string) {
    const testEmail = email || `test-${Date.now()}@example.com`
    const testPassword = password || 'password123'

    // Navigate to sign up page
    await this.page.goto('/sign-up')

    // Wait for Clerk sign-up form to load
    await this.page.waitForSelector('[data-testid="sign-up-form"]', { timeout: 10000 })

    // Fill in credentials
    await this.page.fill('[name="email"]', testEmail)
    await this.page.fill('[name="password"]', testPassword)

    // Submit form
    await this.page.click('[data-testid="sign-up-submit"]')

    // Wait for successful sign up
    await this.page.waitForURL('**/todos', { timeout: 30000 })

    // Verify we're signed in
    await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 10000 })

    return { email: testEmail, password: testPassword }
  }

  async signOut() {
    // Click user menu
    await this.page.click('[data-testid="user-menu"]')

    // Click sign out
    await this.page.click('[data-testid="sign-out-button"]')

    // Wait for sign out to complete
    await this.page.waitForURL('**/', { timeout: 10000 })
  }

  async getCurrentUser() {
    const userMenu = this.page.locator('[data-testid="user-menu"]')
    if (await userMenu.isVisible()) {
      return await userMenu.textContent()
    }
    return null
  }

  async isAuthenticated(): Promise<boolean> {
    return await this.page.locator('[data-testid="user-menu"]').isVisible()
  }
}