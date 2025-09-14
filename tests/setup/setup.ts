import '@testing-library/jest-dom'

// Import mock modules
import '../__mocks__/clerk'
import '../__mocks__/convex'
import '../__mocks__/next-navigation'
import '../__mocks__/next-image'

// Mock Convex generated API
jest.mock('../../convex/_generated/api', () => ({
  api: {
    todos: {
      getTodos: jest.fn(),
      getTodo: jest.fn(),
      createTodo: jest.fn(),
      updateTodo: jest.fn(),
      deleteTodo: jest.fn(),
    },
    users: {
      getUser: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
    },
    categories: {
      getCategories: jest.fn(),
      createCategory: jest.fn(),
      updateCategory: jest.fn(),
      deleteCategory: jest.fn(),
    },
  },
}))

// Mock Convex server functions
jest.mock('convex/server', () => ({
  query: jest.fn(() => jest.fn()),
  mutation: jest.fn(() => jest.fn()),
  action: jest.fn(() => jest.fn()),
}))

// Mock Convex values
jest.mock('convex/values', () => ({
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

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock Request and Response for API routes
global.Request = jest.fn() as any
global.Response = jest.fn() as any

// Mock fetch
global.fetch = jest.fn()

// Mock Headers
global.Headers = jest.fn() as any

// Mock URL and URLSearchParams for API route testing
global.URL = jest.fn() as any
global.URLSearchParams = jest.fn(() => ({
  get: jest.fn(),
  set: jest.fn(),
  has: jest.fn(),
  toString: jest.fn(() => ''),
})) as any
