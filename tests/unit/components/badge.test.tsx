import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('renders with default variant', () => {
    render(<Badge>Default Badge</Badge>)

    const badge = screen.getByText('Default Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-primary')
    expect(badge).toHaveClass('text-primary-foreground')
  })

  it('renders with secondary variant', () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>)

    const badge = screen.getByText('Secondary Badge')
    expect(badge).toHaveClass('bg-secondary')
    expect(badge).toHaveClass('text-secondary-foreground')
  })

  it('renders with destructive variant', () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>)

    const badge = screen.getByText('Destructive Badge')
    expect(badge).toHaveClass('bg-destructive')
    expect(badge).toHaveClass('text-white')
  })

  it('renders with outline variant', () => {
    render(<Badge variant="outline">Outline Badge</Badge>)

    const badge = screen.getByText('Outline Badge')
    expect(badge).toHaveClass('text-foreground')
    expect(badge).toHaveClass('border')
  })

  it('renders as child when asChild is true', () => {
    render(
      <Badge asChild>
        <a href="#" data-testid="custom-badge">
          Custom Badge
        </a>
      </Badge>
    )

    const customBadge = screen.getByTestId('custom-badge')
    expect(customBadge).toBeInTheDocument()
    expect(customBadge).toHaveAttribute('href', '#')
    expect(customBadge).toHaveClass('bg-primary')
  })

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom Class Badge</Badge>)

    const badge = screen.getByText('Custom Class Badge')
    expect(badge).toHaveClass('custom-class')
    expect(badge).toHaveClass('bg-primary') // Should still have default variant classes
  })

  it('forwards additional props', () => {
    render(
      <Badge data-testid="test-badge" aria-label="Test Label">
        Test Badge
      </Badge>
    )

    const badge = screen.getByTestId('test-badge')
    expect(badge).toHaveAttribute('aria-label', 'Test Label')
  })

  it('renders with icons', () => {
    render(
      <Badge>
        <span>Icon</span>
        Badge with Icon
      </Badge>
    )

    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Badge with Icon')).toBeInTheDocument()
  })

  it('has correct default classes', () => {
    render(<Badge>Default Classes</Badge>)

    const badge = screen.getByText('Default Classes')
    expect(badge).toHaveClass('inline-flex')
    expect(badge).toHaveClass('items-center')
    expect(badge).toHaveClass('justify-center')
    expect(badge).toHaveClass('rounded-md')
    expect(badge).toHaveClass('px-2')
    expect(badge).toHaveClass('py-0.5')
    expect(badge).toHaveClass('text-xs')
  })
})
