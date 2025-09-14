import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with default variant and size', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-primary')
    expect(button).toHaveClass('h-10')
    expect(button).toHaveClass('px-4')
    expect(button).toHaveClass('py-2')
  })

  it('renders with destructive variant', () => {
    render(<Button variant="destructive">Delete</Button>)

    const button = screen.getByRole('button', { name: /delete/i })
    expect(button).toHaveClass('bg-destructive')
  })

  it('renders with outline variant', () => {
    render(<Button variant="outline">Cancel</Button>)

    const button = screen.getByRole('button', { name: /cancel/i })
    expect(button).toHaveClass('border')
    expect(button).toHaveClass('border-input')
  })

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)

    const button = screen.getByRole('button', { name: /secondary/i })
    expect(button).toHaveClass('bg-secondary')
  })

  it('renders with ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)

    const button = screen.getByRole('button', { name: /ghost/i })
    expect(button).toHaveClass('hover:bg-accent')
  })

  it('renders with link variant', () => {
    render(<Button variant="link">Link</Button>)

    const button = screen.getByRole('button', { name: /link/i })
    expect(button).toHaveClass('text-primary')
    expect(button).toHaveClass('underline-offset-4')
  })

  it('renders with small size', () => {
    render(<Button size="sm">Small</Button>)

    const button = screen.getByRole('button', { name: /small/i })
    expect(button).toHaveClass('h-9')
    expect(button).toHaveClass('rounded-md')
    expect(button).toHaveClass('px-3')
  })

  it('renders with large size', () => {
    render(<Button size="lg">Large</Button>)

    const button = screen.getByRole('button', { name: /large/i })
    expect(button).toHaveClass('h-11')
    expect(button).toHaveClass('rounded-md')
    expect(button).toHaveClass('px-8')
  })

  it('renders with icon size', () => {
    render(<Button size="icon">Icon</Button>)

    const button = screen.getByRole('button', { name: /icon/i })
    expect(button).toHaveClass('h-10')
    expect(button).toHaveClass('w-10')
  })

  it('renders as child when asChild is true', () => {
    render(
      <Button asChild>
        <a href="#" data-testid="custom-button">
          Custom Button
        </a>
      </Button>
    )

    const customButton = screen.getByTestId('custom-button')
    expect(customButton).toBeInTheDocument()
    expect(customButton).toHaveAttribute('href', '#')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)

    const button = screen.getByRole('button', { name: /disabled/i })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none')
    expect(button).toHaveClass('disabled:opacity-50')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<Button ref={ref}>Ref Test</Button>)

    expect(ref.current).toBeInTheDocument()
  })

  it('spreads additional props', () => {
    render(
      <Button data-testid="extra-prop" aria-label="Extra Label">
        Extra Props
      </Button>
    )

    const button = screen.getByTestId('extra-prop')
    expect(button).toHaveAttribute('aria-label', 'Extra Label')
  })
})
