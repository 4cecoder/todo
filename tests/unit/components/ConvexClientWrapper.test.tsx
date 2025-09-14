import { render, screen, act } from '@testing-library/react'
import { ConvexClientWrapper } from '@/components/ConvexClientWrapper'

// Mock Convex
jest.mock('convex/react', () => ({
  ConvexProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="convex-provider">{children}</div>
  ),
  ConvexReactClient: jest.fn().mockImplementation(() => ({
    close: jest.fn(),
    watchQuery: jest.fn().mockReturnValue({
      collect: jest.fn().mockResolvedValue([]),
    }),
  })),
}))

describe('ConvexClientWrapper', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    // Set up environment variable
    process.env = { ...originalEnv, NEXT_PUBLIC_CONVEX_URL: 'https://test.convex.cloud' }

    // Mock setTimeout to run immediately
    jest.useFakeTimers()
  })

  afterEach(() => {
    process.env = originalEnv
    jest.useRealTimers()
  })

  it('renders loading state initially', () => {
    render(
      <ConvexClientWrapper>
        <div>Test Child</div>
      </ConvexClientWrapper>
    )

    expect(screen.getByText('Initializing connection...')).toBeInTheDocument()
  })

  it('renders children when Convex client is initialized', async () => {
    const { ConvexReactClient } = require('convex/react')

    render(
      <ConvexClientWrapper>
        <div>Test Child</div>
      </ConvexClientWrapper>
    )

    // Fast-forward timers to simulate connection establishment
    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    expect(ConvexReactClient).toHaveBeenCalledWith('https://test.convex.cloud')
    expect(screen.getByTestId('convex-provider')).toBeInTheDocument()
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('shows connection error when Convex URL is missing', async () => {
    delete process.env.NEXT_PUBLIC_CONVEX_URL

    render(
      <ConvexClientWrapper>
        <div>Test Child</div>
      </ConvexClientWrapper>
    )

    // Fast-forward timers to simulate connection attempt
    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    expect(screen.getByText('Connection Issue')).toBeInTheDocument()
    expect(screen.getByText('Convex URL is not configured')).toBeInTheDocument()
  })

  it('shows connection error and retry button when connection fails', async () => {
    const { ConvexReactClient } = require('convex/react')
    // Mock connection failure
    ConvexReactClient.mockImplementation(() => {
      throw new Error('Connection failed')
    })

    render(
      <ConvexClientWrapper>
        <div>Test Child</div>
      </ConvexClientWrapper>
    )

    // Fast-forward timers to simulate connection attempt and retry
    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    expect(screen.getByText('Connection Issue')).toBeInTheDocument()
    expect(screen.getByText('Connection failed')).toBeInTheDocument()
    expect(screen.getByText('Retrying connection...')).toBeInTheDocument()
    expect(screen.getByText('Reload Page')).toBeInTheDocument()
  })

  it('handles multiple children', async () => {
    const { ConvexReactClient } = require('convex/react')

    render(
      <ConvexClientWrapper>
        <div>First Child</div>
        <div>Second Child</div>
        <span>Third Child</span>
      </ConvexClientWrapper>
    )

    // Fast-forward timers to simulate connection establishment
    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    expect(screen.getByText('First Child')).toBeInTheDocument()
    expect(screen.getByText('Second Child')).toBeInTheDocument()
    expect(screen.getByText('Third Child')).toBeInTheDocument()
  })

  it('handles empty children', async () => {
    render(<ConvexClientWrapper>{null}</ConvexClientWrapper>)

    // Fast-forward timers to simulate connection establishment
    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    expect(screen.getByTestId('convex-provider')).toBeInTheDocument()
  })

  it('cleans up on unmount', async () => {
    const { ConvexReactClient } = require('convex/react')
    const mockClose = jest.fn()
    ConvexReactClient.mockImplementation(() => ({
      close: mockClose,
      watchQuery: jest.fn().mockReturnValue({
        collect: jest.fn().mockResolvedValue([]),
      }),
    }))

    const { unmount } = render(
      <ConvexClientWrapper>
        <div>Test Child</div>
      </ConvexClientWrapper>
    )

    // Fast-forward timers to simulate connection establishment
    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    unmount()

    expect(mockClose).toHaveBeenCalled()
  })
})
