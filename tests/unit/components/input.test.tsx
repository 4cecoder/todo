import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('flex')
    expect(input).toHaveClass('h-10')
    expect(input).toHaveClass('w-full')
  })

  it('renders with custom type', () => {
    render(<Input type="email" data-testid="email-input" />)

    const input = screen.getByTestId('email-input')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" data-testid="placeholder-input" />)

    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    render(<Input className="custom-class" data-testid="custom-input" />)

    const input = screen.getByTestId('custom-input')
    expect(input).toHaveClass('custom-class')
    expect(input).toHaveClass('flex') // Should still have default classes
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<Input ref={ref} data-testid="ref-input" />)

    const input = screen.getByTestId('ref-input')
    expect(ref.current).toBe(input)
  })

  it('handles user input', async () => {
    const user = userEvent.setup()
    render(<Input data-testid="user-input" />)

    const input = screen.getByTestId('user-input')
    await user.type(input, 'Hello World')

    expect(input).toHaveValue('Hello World')
  })

  it('forwards additional props', () => {
    render(<Input data-testid="props-input" maxLength={10} required />)

    const input = screen.getByTestId('props-input')
    expect(input).toHaveAttribute('maxLength', '10')
    expect(input).toHaveAttribute('required')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled data-testid="disabled-input" />)

    const input = screen.getByTestId('disabled-input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed')
    expect(input).toHaveClass('disabled:opacity-50')
  })

  it('has correct focus styles', () => {
    render(<Input data-testid="focus-input" />)

    const input = screen.getByTestId('focus-input')
    expect(input).toHaveClass('focus-visible:ring-2')
    expect(input).toHaveClass('focus-visible:ring-ring')
  })
})
