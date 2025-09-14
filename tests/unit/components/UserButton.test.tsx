import { render, screen } from '@testing-library/react'
import { CustomUserButton } from '@/components/UserButton'

// Mock Clerk's UserButton
jest.mock('@clerk/nextjs', () => ({
  UserButton: jest.fn(({ appearance }) => (
    <div data-testid="clerk-user-button" data-appearance={JSON.stringify(appearance)}>
      Mock User Button
    </div>
  )),
}))

describe('CustomUserButton', () => {
  it('renders Clerk UserButton with appearance configuration', () => {
    const { UserButton } = require('@clerk/nextjs')

    render(<CustomUserButton />)

    expect(UserButton).toHaveBeenCalledWith(
      expect.objectContaining({
        appearance: expect.objectContaining({
          elements: expect.objectContaining({
            avatarBox: 'w-10 h-10 ring-2 ring-border hover:ring-ring transition-colors',
          }),
        }),
        userProfileMode: 'navigation',
        userProfileUrl: '/profile',
        showName: false,
        afterSignOutUrl: '/',
      }),
      {}
    )

    expect(screen.getByTestId('clerk-user-button')).toBeInTheDocument()
    expect(screen.getByText('Mock User Button')).toBeInTheDocument()
  })

  it('includes avatarBox styling in appearance', () => {
    const { UserButton } = require('@clerk/nextjs')

    render(<CustomUserButton />)

    const call = UserButton.mock.calls[0][0]
    expect(call.appearance.elements.avatarBox).toContain('w-10 h-10')
  })
})
