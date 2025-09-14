import { test, expect } from '../test-config'
import { TEST_CONFIG } from '../test-config'

test.describe('Todo Management - Authenticated', () => {
  test('should create a new todo item', async ({ authenticatedPage, pageHelper }) => {
    // Navigate to todos page
    await authenticatedPage.goto(TEST_CONFIG.urls.todos)
    await pageHelper.waitForPageLoad()

    // Wait for todo input to be visible
    await pageHelper.waitForElement(TEST_CONFIG.selectors.todoInput)

    // Create a new todo
    const todoTitle = TEST_CONFIG.testData.todos.sampleTodo.title
    await authenticatedPage.fill(TEST_CONFIG.selectors.todoInput, todoTitle)
    await authenticatedPage.press('Enter')

    // Verify todo was created
    await expect(authenticatedPage.locator(TEST_CONFIG.selectors.todoList)).toContainText(todoTitle)
  })

  test('should mark todo as completed', async ({ authenticatedPage, pageHelper }) => {
    // Navigate to todos page
    await authenticatedPage.goto(TEST_CONFIG.urls.todos)
    await pageHelper.waitForPageLoad()

    // Create a todo first
    const todoTitle = 'Complete this task'
    await authenticatedPage.fill(TEST_CONFIG.selectors.todoInput, todoTitle)
    await authenticatedPage.press('Enter')

    // Find the todo item and mark as completed
    const todoItem = authenticatedPage.locator(TEST_CONFIG.selectors.todoItem).filter({ hasText: todoTitle })
    await todoItem.locator('input[type="checkbox"]').check()

    // Verify it's marked as completed (should have completed styling)
    await expect(todoItem).toHaveClass(/completed/)
  })

  test('should delete a todo item', async ({ authenticatedPage, pageHelper }) => {
    // Navigate to todos page
    await authenticatedPage.goto(TEST_CONFIG.urls.todos)
    await pageHelper.waitForPageLoad()

    // Create a todo first
    const todoTitle = 'Delete this task'
    await authenticatedPage.fill(TEST_CONFIG.selectors.todoInput, todoTitle)
    await authenticatedPage.press('Enter')

    // Find and delete the todo
    const todoItem = authenticatedPage.locator(TEST_CONFIG.selectors.todoItem).filter({ hasText: todoTitle })
    await todoItem.locator('[data-testid="delete-todo"]').click()

    // Verify todo was deleted
    await expect(authenticatedPage.locator(TEST_CONFIG.selectors.todoList)).not.toContainText(todoTitle)
  })

  test('should filter todos by category', async ({ authenticatedPage, pageHelper }) => {
    // Navigate to todos page
    await authenticatedPage.goto(TEST_CONFIG.urls.todos)
    await pageHelper.waitForPageLoad()

    // Create todos in different categories
    await authenticatedPage.fill(TEST_CONFIG.selectors.todoInput, 'Work task')
    await authenticatedPage.press('Enter')

    await authenticatedPage.fill(TEST_CONFIG.selectors.todoInput, 'Personal task')
    await authenticatedPage.press('Enter')

    // Select work category filter
    await authenticatedPage.selectOption(TEST_CONFIG.selectors.categorySelect, 'work')

    // Verify only work todos are visible
    await expect(authenticatedPage.locator(TEST_CONFIG.selectors.todoList)).toContainText('Work task')
    await expect(authenticatedPage.locator(TEST_CONFIG.selectors.todoList)).not.toContainText('Personal task')
  })
})