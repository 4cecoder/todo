import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Provide a jest compatibility alias for tests that use jest.* APIs
;(global as any).jest = vi

// Import mock modules
import clerkMock from '../__mocks__/clerk'
import convexMock from '../__mocks__/convex'
import nextNavigationMock from '../__mocks__/next-navigation'
import nextImageMock from '../__mocks__/next-image'

// Ensure module mocks are registered with Vitest
vi.mock('@clerk/nextjs', () => clerkMock)
vi.mock('@clerk/nextjs/server', () => ({
  auth: clerkMock.auth,
  ClerkProvider: clerkMock.ClerkProvider,
}))
vi.mock('convex/react', () => ({
  useQuery: convexMock.useQuery,
  useMutation: convexMock.useMutation,
  useAction: convexMock.useAction,
  ConvexReactClient: vi.fn(),
}))
vi.mock('../../convex/_generated/api', () => ({
  api: {
    todos: {
      getTodos: vi.fn(),
      getTodo: vi.fn(),
      createTodo: vi.fn(),
      updateTodo: vi.fn(),
      deleteTodo: vi.fn(),
    },
    users: {
      getUser: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
    },
    categories: {
      getCategories: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
    },
  },
}))

vi.mock('convex/server', () => ({
  query: vi.fn(() => vi.fn()),
  mutation: vi.fn(() => vi.fn()),
  action: vi.fn(() => vi.fn()),
}))

vi.mock('convex/values', () => ({
  v: {
    string: () => 'string',
    id: () => 'id',
    optional: () => 'optional',
    boolean: () => 'boolean',
    number: () => 'number',
    array: () => 'array',
    object: () => 'object',
    literal: () => 'literal',
    union: () => 'union',
    record: () => 'record',
  },
}))

vi.mock('next/navigation', () => nextNavigationMock)
vi.mock('next/image', () => nextImageMock)

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock Request and Response for API routes
global.Request = vi.fn() as any
global.Response = vi.fn() as any

// Mock fetch
global.fetch = vi.fn()

// Mock Headers
global.Headers = vi.fn() as any

// Mock URL and URLSearchParams for API route testing
global.URL = vi.fn() as any
global.URLSearchParams = vi.fn(() => ({
  get: vi.fn(),
  set: vi.fn(),
  has: vi.fn(),
  toString: vi.fn(() => ''),
})) as any
