import { GET } from '@/app/api/auth/me/route'

// Mock the auth function
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

describe('/api/auth/me', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns user data when authenticated', async () => {
    const { auth } = require('@clerk/nextjs/server')
    ;(auth as jest.Mock).mockResolvedValue({
      userId: 'test-user-id',
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      userId: 'test-user-id',
      message: 'User is authenticated',
    })
  })

  it('returns 401 when not authenticated', async () => {
    const { auth } = require('@clerk/nextjs/server')
    ;(auth as jest.Mock).mockResolvedValue({
      userId: null,
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Not authenticated' })
  })

  it('returns 500 when authentication fails', async () => {
    const { auth } = require('@clerk/nextjs/server')
    ;(auth as jest.Mock).mockRejectedValue(new Error('Authentication failed'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Authentication failed' })
  })
})
