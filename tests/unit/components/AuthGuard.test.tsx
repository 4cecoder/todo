import { render, screen } from '@testing-library/react'
import { AuthGuard } from '@/components/AuthGuard'

// Mock the hooks using the existing setup
const mockUseAuth = jest.fn()
const mockUseUser = jest.fn()
const mockUseRouter = jest.fn()

jest.mock('@clerk/nextjs', () => ({
  useAuth: () => mockUseAuth(),
  useUser: () => mockUseUser(),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
}))

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: false,
      userId: undefined,
    })
    mockUseUser.mockReturnValue({
      isLoaded: false,
      user: null,
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      userId: 'test-user-id',
    })
    mockUseUser.mockReturnValue({
      isLoaded: true,
      user: { id: 'test-user-id', firstName: 'Test' },
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('renders nothing when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      userId: null,
    })
    mockUseUser.mockReturnValue({
      isLoaded: true,
      user: null,
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('handles multiple children correctly', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      userId: 'test-user-id',
    })
    mockUseUser.mockReturnValue({
      isLoaded: true,
      user: { id: 'test-user-id', firstName: 'Test' },
    })

    render(
      <AuthGuard>
        <div>First Child</div>
        <div>Second Child</div>
        <span>Third Child</span>
      </AuthGuard>
    )

    expect(screen.getByText('First Child')).toBeInTheDocument()
    expect(screen.getByText('Second Child')).toBeInTheDocument()
    expect(screen.getByText('Third Child')).toBeInTheDocument()
  })
})
