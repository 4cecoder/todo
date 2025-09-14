import { test as base, expect, Page } from '@playwright/test'
import { AuthHelper } from './auth-helper'
import { DatabaseHelper } from './database-helper'
import { PageHelper } from './page-helper'

// Extend the base test with our custom fixtures
type TestFixtures = {
  authHelper: AuthHelper
  dbHelper: DatabaseHelper
  pageHelper: PageHelper
  authenticatedPage: Page
}

export const test = base.extend<TestFixtures>({
  // Auth helper fixture
  authHelper: async ({ page }: { page: Page }, useHelper: (authHelper: AuthHelper) => Promise<void>) => {
    const authHelper = new AuthHelper(page)
    await useHelper(authHelper)
  },

  // Database helper fixture
  dbHelper: async ({}, useHelper: (dbHelper: DatabaseHelper) => Promise<void>) => {
    const dbHelper = new DatabaseHelper()
    await useHelper(dbHelper)
    // Cleanup after test
    await dbHelper.cleanup()
  },

  // Page helper fixture
  pageHelper: async ({ page }: { page: Page }, useHelper: (pageHelper: PageHelper) => Promise<void>) => {
    const pageHelper = new PageHelper(page)
    await useHelper(pageHelper)
  },

  // Authenticated page fixture
  authenticatedPage: async ({ page }: { page: Page }, useHelper: (page: Page) => Promise<void>) => {
    const authHelper = new AuthHelper(page)
    // Sign in before test
    await authHelper.signInAsTestUser()
    await useHelper(page)
    // Sign out after test
    await authHelper.signOut()
  },
})

export { expect }