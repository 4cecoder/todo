// Global setup for Jest tests
export default async function globalSetup() {
  // Set up global test environment
  // Mock console methods for testing
  ;(global as any).console = {
    ...console,
    // Uncomment to ignore specific console methods in tests
    // log: jest.fn(),
    // warn: jest.fn(),
    // error: jest.fn(),
  }

  // Set up global test variables
  ;(global as any).TEST_MODE = true
  ;(global as any).TEST_TIMEOUT = 10000

  // Set up test environment variables
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api'
  process.env.NEXT_PUBLIC_CONVEX_URL = 'http://localhost:3001'
  process.env.CLERK_PUBLISHABLE_KEY = 'test_clerk_key'
  process.env.CLERK_SECRET_KEY = 'test_clerk_secret'

  // Mock browser APIs that aren't available in Node.js
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })

  Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({
      getPropertyValue: () => {
        return ''
      },
    }),
  })

  // Mock ResizeObserver
  ;(global as any).ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))

  // Mock IntersectionObserver
  ;(global as any).IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))

  // Mock scrollTo
  Object.defineProperty(window, 'scrollTo', {
    value: jest.fn(),
  })

  // Mock focus
  Object.defineProperty(HTMLElement.prototype, 'focus', {
    value: jest.fn(),
  })

  // Mock click
  Object.defineProperty(HTMLElement.prototype, 'click', {
    value: jest.fn(),
  })

  console.log('Global test setup completed')
}
