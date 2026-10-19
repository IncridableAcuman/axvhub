import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Saqlash</Button>)
    const button = screen.getByRole('button', { name: /saqlash/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'button')
  })

  it('triggers onClick handler when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Tasdiqlash</Button>)
    await user.click(screen.getByRole('button', { name: /tasdiqlash/i }))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true and does not fire onClick', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button disabled onClick={handleClick}>Nofaol</Button>)
    const button = screen.getByRole('button', { name: /nofaol/i })

    expect(button).toBeDisabled()
    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('shows loading spinner and disables interaction when isLoading is true', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Button isLoading loadingText="Yuklanmoqda..." onClick={handleClick}>
        Yuborish
      </Button>
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('Yuklanmoqda...')).toBeInTheDocument()

    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders left and right icons correctly', () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon">L</span>}
        rightIcon={<span data-testid="right-icon">R</span>}
      >
        Ikonkali
      </Button>
    )

    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })
})
