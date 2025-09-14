# Testing Setup for ByteCats Todo App

This directory contains the complete testing environment for the ByteCats Todo application, including both unit/integration tests and end-to-end tests.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Playwright browsers installed

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run test:e2e:install
```

### Running Tests

#### Unit/Integration Tests

```bash
# Run all unit tests with Jest
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage
npm run test:coverage

# Run unit tests with Vitest
npm run test:ui
```

#### End-to-End Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run tests headlessly
npm run test:e2e:headed

# Run tests for specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit

# Test Convex database connection
npm run test:convex

# View test report
npm run test:e2e:report
```

## 📁 Project Structure

```
tests/
├── __mocks__/                  # Mock modules for unit tests
│   ├── clerk.ts               # Clerk authentication mocks
│   ├── convex.ts              # Convex database mocks
│   ├── next-navigation.ts     # Next.js navigation mocks
│   └── next-image.ts          # Next.js image mocks
├── __fixtures__/              # Test fixtures and data
│   └── test-fixtures.ts       # Common test data
├── __utils__/                 # Shared test utilities
│   ├── test-environment.ts   # Test environment configuration
│   └── test-helpers.ts        # Test helper functions
├── setup/                     # Test setup files
│   ├── setup.ts              # Global test setup
│   └── test-convex-connection.js # Convex connection test utility
├── unit/                      # Unit and integration tests
│   ├── components/           # Component tests
│   ├── lib/                 # Library/utility tests
│   ├── app/                 # App router tests
│   └── convex/              # Convex function tests
├── e2e/                      # End-to-end tests
│   ├── fixtures.ts          # E2E test fixtures
│   ├── global-setup.ts      # Global test setup
│   ├── global-teardown.ts   # Global test teardown
│   ├── test-config.ts       # Test configuration and utilities
│   ├── auth-helper.ts       # Authentication test helpers
│   ├── database-helper.ts   # Database test helpers
│   ├── page-helper.ts       # Page interaction helpers
│   ├── utils/
│   │   ├── test-database.ts # Database setup utilities
│   │   └── test-users.ts    # Test user management
│   ├── auth-flow.spec.ts    # Authentication flow tests
│   ├── auth-flow-complete.spec.ts # Complete auth tests
│   ├── home-page.spec.ts    # Home page tests
│   ├── todo-management.spec.ts # Basic todo tests
│   └── todo-management-complete.spec.ts # Complete todo tests
├── test-results/            # Test results and screenshots
└── playwright-report/       # HTML test reports
```

## 🧪 Unit/Integration Testing

### Test Structure

Unit tests are organized by feature in the `tests/unit/` directory:

- **Components**: React component tests using React Testing Library
- **Lib**: Utility function tests
- **App**: App router and API route tests
- **Convex**: Database function tests

### Available Mocks

The `tests/__mocks__/` directory contains pre-configured mocks for:

- **Clerk**: Authentication and user management
- **Convex**: Database operations and React hooks
- **Next.js Navigation**: Router and navigation hooks
- **Next.js Image**: Image component optimization

### Test Fixtures

Common test data is available in `tests/__fixtures__/test-fixtures.ts`:

```typescript
import { fixtures } from '../__fixtures__/test-fixtures'

// Use pre-defined test data
const mockUser = fixtures.users.default
const mockTodo = fixtures.todos.default
const mockCategory = fixtures.categories.work
```

### Test Helpers

Utility functions are available in `tests/__utils__/test-helpers.ts`:

```typescript
import { createTodo, createUser, testUtils } from '../__utils__/test-helpers'

// Create test data
const todo = createTodo({ title: 'Custom Todo' })
const user = createUser({ email: 'custom@example.com' })

// Use test utilities
await testUtils.waitFor(1000)
const mockEvent = testUtils.createMockEvent('click')
```

## 🔧 Configuration

### Environment Variables

Create a `.env.test.local` file with your test configuration:

```bash
# Base URL for testing
BASE_URL=http://localhost:3000

# Clerk Authentication (Test Instance)
CLERK_PUBLISHABLE_KEY=pk_test_your_test_publishable_key
CLERK_SECRET_KEY=sk_test_your_test_secret_key
CLERK_DOMAIN=your-test-domain.clerk.accounts.dev

# Convex Database (Test Instance)
NEXT_PUBLIC_CONVEX_URL=https://your-test-deployment.convex.cloud

# Test User Credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123

# Test Database Settings
TEST_DATABASE_CLEANUP=true

# Playwright Settings
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_SLOW_MO=0
PLAYWRIGHT_VIDEO_DIR=test-results/videos
PLAYWRIGHT_SCREENSHOT_DIR=test-results/screenshots

# CI Settings
CI=false
```

### Playwright Configuration

The `playwright.config.ts` file contains:

- Browser configurations (Chromium, Firefox, WebKit)
- Test timeouts and retries
- Global setup/teardown
- Screenshot and video settings
- CI-specific configurations

## 🧪 Test Fixtures

### Available Fixtures

- `authHelper`: Authentication utilities
- `dbHelper`: Database interaction helpers
- `pageHelper`: Page interaction utilities
- `authenticatedPage`: Pre-authenticated page for tests

### Usage Example

```typescript
import { test } from '../test-config'

test('should create todo when authenticated', async ({ authenticatedPage, pageHelper }) => {
  await authenticatedPage.goto('/todos')
  await pageHelper.waitForPageLoad()

  // Test logic here
})
```

## 🔐 Authentication Testing

### Test User Setup

The authentication helper provides methods for:

- Signing in as test user
- Signing up new test users
- Signing out
- Checking authentication status

### Example

```typescript
import { test } from '../test-config'

test('should handle user authentication', async ({ authHelper, page }) => {
  // Sign in
  await authHelper.signInAsTestUser()

  // Verify authentication
  expect(await authHelper.isAuthenticated()).toBe(true)

  // Sign out
  await authHelper.signOut()
})
```

## 🗄️ Database Testing

### Database Helper

Provides utilities for:

- Creating test users
- Managing test categories
- Creating and managing test todos
- Cleaning up test data

### Example

```typescript
import { test } from '../test-config'

test('should manage database state', async ({ dbHelper }) => {
  // Create test data
  const user = await dbHelper.createTestUser('test-id', 'test@example.com')
  const category = await dbHelper.createTestCategory(user.id, 'Work')
  const todo = await dbHelper.createTestTodo(user.id, 'Test task', category.id)

  // Test logic here

  // Cleanup happens automatically
})
```

## 📱 Page Helpers

### Available Methods

- `waitForPageLoad()`: Wait for page to fully load
- `waitForElement(selector)`: Wait for element to appear
- `clickAndWait(selector, waitFor?)`: Click and optionally wait for another element
- `fillAndWait(selector, value)`: Fill input and wait
- `getTextContent(selector)`: Get element text content
- `isVisible(selector)`: Check element visibility
- `takeScreenshot(name)`: Take screenshot for debugging
- `scrollToElement(selector)`: Scroll element into view
- `waitForURL(url)`: Wait for specific URL
- `reloadAndWait()`: Reload page and wait
- `clearInput(selector)`: Clear input field
- `pressKey(key)`: Press keyboard key
- `hover(selector)`: Hover over element

## 🎯 Test Categories

### Home Page Tests (`home-page.spec.ts`)

- Page loading and basic navigation
- Authentication flow (sign in/sign up)
- Feature list display
- Loading states

### Todo Management Tests (`todo-management.spec.ts`)

- Basic CRUD operations for todos
- Authentication redirects
- Form validation
- Category filtering

### Complete Todo Tests (`todo-management-complete.spec.ts`)

- Advanced todo operations
- Real-time updates
- Bulk operations
- Complex user flows

## 🚀 CI/CD Integration

### GitHub Actions

The CI pipeline includes:

- Dependency installation
- Browser installation
- Linting
- Unit tests with coverage
- E2E tests
- Test result artifacts
- Coverage reporting

### Required Secrets

Set these in your GitHub repository secrets:

- `NEXT_PUBLIC_CONVEX_URL`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`
- `CONVEX_DEPLOY_KEY`
- `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`
- `VERCEL_ORG_ID`

## 🐛 Debugging Tests

### Visual Debugging

```bash
# Run tests in headed mode
npm run test:e2e:headed

# Run tests with UI
npm run test:e2e:ui

# Run specific test in debug mode
npm run test:e2e:debug -- --grep "test name"
```

### Screenshots and Videos

- Screenshots are automatically captured on failures
- Videos can be enabled in CI for debugging
- All artifacts are stored in `test-results/`

### Console Logs

- Browser console messages are captured
- Network requests are logged
- Test execution logs are available

## 📊 Test Reporting

### HTML Reports

```bash
npm run test:e2e:report
```

Opens an interactive HTML report with:

- Test results and timings
- Screenshots and videos
- Console logs and network activity
- Test execution traces

### CI Reports

- Test results uploaded as artifacts
- Coverage reports sent to Codecov
- GitHub annotations for failed tests

## 🔧 Maintenance

### Adding New Tests

1. Create new `.spec.ts` file in `tests/e2e/`
2. Use existing fixtures and helpers
3. Follow the naming convention: `feature-name.spec.ts`
4. Add appropriate test descriptions

### Updating Selectors

1. Use data-testid attributes for reliable selectors
2. Update `TEST_CONFIG.selectors` when adding new elements
3. Run tests to verify selector changes

### Browser Compatibility

- Tests run on Chromium, Firefox, and WebKit
- Mobile testing supported via device emulation
- Cross-browser issues are automatically detected

## 🆘 Troubleshooting

### Common Issues

1. **Browser installation fails**

   ```bash
   npx playwright install --with-deps
   ```

2. **Tests timeout**
   - Increase timeout in `playwright.config.ts`
   - Check network connectivity
   - Verify application is running

3. **Authentication fails**
   - Verify test user credentials
   - Check Clerk configuration
   - Ensure test environment variables are set

4. **Database connection issues**
   - Verify Convex URL
   - Check database permissions
   - Ensure test data cleanup

### Getting Help

- Check the HTML test report for detailed error information
- Review browser console logs
- Enable debug mode for step-by-step execution
- Check network tab for failed requests

## 📈 Best Practices

### Test Organization

- Group related tests in describe blocks
- Use descriptive test names
- Keep tests focused and atomic
- Use page objects for complex interactions

### Selector Strategy

- Prefer data-testid attributes
- Use semantic selectors when possible
- Avoid brittle CSS selectors
- Test accessibility features

### Performance

- Use fixtures for shared setup
- Minimize page reloads
- Parallel test execution
- Optimize wait strategies

### Reliability

- Handle async operations properly
- Use appropriate wait conditions
- Test error states and edge cases
- Clean up test data after execution

This testing setup provides a robust foundation for maintaining and extending the ByteCats Todo application's test coverage.
