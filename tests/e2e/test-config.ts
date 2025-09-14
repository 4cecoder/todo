import { test as baseTest, expect, Page } from '@playwright/test'
import { AuthHelper } from './auth-helper'
import { DatabaseHelper } from './database-helper'
import { PageHelper } from './page-helper'

// Test configuration
export const TEST_CONFIG = {
  timeouts: {
    action: 10000,
    navigation: 30000,
    expectation: 10000,
  },
  selectors: {
    signInButton: '[data-testid="sign-in-button"]',
    signUpButton: '[data-testid="sign-up-button"]',
    signOutButton: '[data-testid="sign-out-button"]',
    userMenu: '[data-testid="user-menu"]',
    todoInput: '[data-testid="todo-input"]',
    todoList: '[data-testid="todo-list"]',
    todoItem: '[data-testid="todo-item"]',
    categorySelect: '[data-testid="category-select"]',
    loadingSpinner: '[data-testid="loading-spinner"]',
  },
  urls: {
    home: '/',
    todos: '/todos',
    signIn: '/sign-in',
    signUp: '/sign-up',
  },
  testData: {
    users: {
      testUser: {
        email: process.env.TEST_USER_EMAIL || 'test@example.com',
        password: process.env.TEST_USER_PASSWORD || 'password123',
        name: 'Test User',
      },
    },
    todos: {
      sampleTodo: {
        title: 'Test Todo Item',
        description: 'This is a test todo item',
      },
    },
    categories: {
      work: {
        name: 'Work',
        color: '#FF6B6B',
      },
      personal: {
        name: 'Personal',
        color: '#4ECDC4',
      },
    },
  },
}

// Custom test fixtures
type TestFixtures = {
  authHelper: AuthHelper
  dbHelper: DatabaseHelper
  pageHelper: PageHelper
  authenticatedPage: Page
}

export const test = baseTest.extend<TestFixtures>({
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