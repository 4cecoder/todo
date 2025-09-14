// Test helpers and utilities for unit tests
import { testData } from './test-environment'

// Re-export test data for convenience
export { testData }

// Create a mock todo
export const createTodo = (overrides = {}) => ({
  _id: 'todo-1',
  userId: 'test-user-id',
  title: 'Test Todo',
  description: 'Test description',
  completed: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
})

// Create a mock user
export const createUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  clerkId: 'test-clerk-id',
  createdAt: Date.now(),
  ...overrides,
})

// Create a mock authentication response
export const createAuthResponse = (userId: string) => ({
  userId,
  sessionId: 'test-session-id',
  getToken: () => Promise.resolve('test-token'),
  has: () => true,
  debug: () => {},
  isAuthenticated: true,
  sessionClaims: {},
  sessionStatus: 'active',
  actor: null,
  orgId: null,
  orgRole: null,
  orgSlug: null,
  tenantId: null,
  user: {
    id: userId,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: 'test-image-url',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
  },
  orgPermissions: [],
  factorVerificationAge: 0,
})

// Mock data generators
export const mockData = {
  todo: createTodo,
  user: createUser,
  auth: createAuthResponse,
}

// Test utility functions
export const testUtils = {
  // Wait for async operations
  waitFor: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Create mock event
  createMockEvent: (type: string, data?: any) => ({
    type,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    ...data,
  }),

  // Create mock form data
  createMockFormData: (data: Record<string, string>) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value)
    })
    return formData
  },

  // Mock console methods
  mockConsole: () => {
    const originalConsole = { ...console }
    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {})
      jest.spyOn(console, 'error').mockImplementation(() => {})
      jest.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    return originalConsole
  },
}
