import { test, expect } from '@playwright/test'

test.describe('Todo App E2E Tests', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')

    // Check if the page loads
    await expect(page).toHaveTitle(/Todo App/)

    // Check for main elements
    await expect(page.getByText('Todo App')).toBeVisible()
    await expect(page.getByText('Organize your tasks with ease')).toBeVisible()
  })

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/')

    // Click sign in button
    await page.getByRole('link', { name: /sign in/i }).click()

    // Should navigate to Clerk sign in page
    await expect(page).toHaveURL(/.*sign-in.*/)
  })

  test('should navigate to sign up page', async ({ page }) => {
    await page.goto('/')

    // Click sign up button
    await page.getByRole('link', { name: /sign up/i }).click()

    // Should navigate to Clerk sign up page
    await expect(page).toHaveURL(/.*sign-up.*/)
  })

  test('should show loading state initially', async ({ page }) => {
    await page.goto('/')

    // Check for loading spinner or text
    await expect(page.getByText('Loading...')).toBeVisible()
  })

  test('should display feature list on home page', async ({ page }) => {
    await page.goto('/')

    // Check for feature items
    await expect(page.getByText('Create and manage your todos')).toBeVisible()
    await expect(page.getByText('Organize tasks by priority')).toBeVisible()
    await expect(page.getByText('Track your progress')).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')

    // Check that links are present
    const signInLink = page.getByRole('link', { name: /sign in/i })
    const signUpLink = page.getByRole('link', { name: /sign up/i })

    await expect(signInLink).toBeVisible()
    await expect(signUpLink).toBeVisible()

    // Check that links have correct href attributes
    await expect(signInLink).toHaveAttribute('href', '/sign-in')
    await expect(signUpLink).toHaveAttribute('href', '/sign-up')
  })
})