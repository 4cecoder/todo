// Test environment configuration
export const testConfig = {
  // Mock environment variables for testing
  env: {
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_CONVEX_URL: 'http://localhost:3000',
  },
  
  // Test database configuration
  database: {
    mockUser: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      clerkId: 'test-clerk-id',
      createdAt: Date.now(),
    },
    
    mockTodos: [
      {
        _id: 'todo-1',
        userId: 'test-user-id',
        title: 'Test Todo 1',
        description: 'Test description 1',
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        _id: 'todo-2',
        userId: 'test-user-id',
        title: 'Test Todo 2',
        description: 'Test description 2',
        completed: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
  },
  
  // Test utilities
  utils: {
    // Mock authentication
    mockAuth: (userId: string) => ({
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
    }),
    
    // Mock database operations
    mockDatabase: {
      query: () => ({
        withIndex: () => ({
          eq: () => ({
            first: () => Promise.resolve(null),
            collect: () => Promise.resolve([]),
          }),
        }),
        get: () => Promise.resolve(null),
        insert: () => Promise.resolve('mock-id'),
        patch: () => Promise.resolve(),
        delete: () => Promise.resolve(),
      }),
    },
    
    // Mock Convex functions
    mockConvex: {
      query: () => jest.fn(),
      mutation: () => jest.fn(),
    },
  },
}

// Export test data
export const testData = {
  user: testConfig.database.mockUser,
  todos: testConfig.database.mockTodos,
}

// Export test helpers
export const testHelpers = {
  // Create a mock todo
  createTodo: (overrides = {}) => ({
    _id: 'todo-1',
    userId: 'test-user-id',
    title: 'Test Todo',
    description: 'Test description',
    completed: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }),
  
  // Create a mock user
  createUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    clerkId: 'test-clerk-id',
    createdAt: Date.now(),
    ...overrides,
  }),
  
  // Create a mock authentication response
  createAuthResponse: (userId: string) => ({
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
  }),
}