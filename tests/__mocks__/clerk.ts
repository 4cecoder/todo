// Mock for @clerk/nextjs
export const auth = jest.fn(() =>
  Promise.resolve({
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    getToken: jest.fn(() => Promise.resolve('test-token')),
  })
)

export const ClerkProvider = jest.fn(({ children }) => children)
export const UserButton = jest.fn(() => 'Mock UserButton')
export const SignedIn = jest.fn(({ children }) => children)
export const SignedOut = jest.fn(({ children }) => children)
export const useAuth = jest.fn(() => ({
  isLoaded: true,
  userId: 'test-user-id',
}))
export const useUser = jest.fn(() => ({
  isLoaded: true,
  user: { id: 'test-user-id', firstName: 'Test' },
}))

export default {
  auth,
  ClerkProvider,
  UserButton,
  SignedIn,
  SignedOut,
  useAuth,
  useUser,
}
