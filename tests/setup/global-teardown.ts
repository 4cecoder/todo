// Global teardown for Jest tests
export default async function globalTeardown() {
  // Clean up global test environment
  if ((global as any).TEST_MODE) {
    delete (global as any).TEST_MODE
  }

  if ((global as any).TEST_TIMEOUT) {
    delete (global as any).TEST_TIMEOUT
  }

  // Clean up any global mocks
  if ((global as any).ResizeObserver) {
    delete (global as any).ResizeObserver
  }

  if ((global as any).IntersectionObserver) {
    delete (global as any).IntersectionObserver
  }

  // Clean up environment variables
  delete process.env.NEXT_PUBLIC_API_URL
  delete process.env.NEXT_PUBLIC_CONVEX_URL
  delete process.env.CLERK_PUBLISHABLE_KEY
  delete process.env.CLERK_SECRET_KEY

  console.log('Global test teardown completed')
}
