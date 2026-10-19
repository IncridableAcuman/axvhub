import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../Input'
import { FormField } from '../../form/FormField'

describe('Input and FormField components', () => {
  it('accepts and updates typed values', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<Input placeholder="Ismni kiriting" onChange={handleChange} />)
    const input = screen.getByPlaceholderText('Ismni kiriting')

    await user.type(input, 'Izzatbek')
    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue('Izzatbek')
  })

  it('triggers onClear callback when clear button is clicked', async () => {
    const handleClear = vi.fn()
    const user = userEvent.setup()

    render(<Input value="Test text" onClear={handleClear} onChange={() => {}} />)
    const clearBtn = screen.getByLabelText('Matnni tozalash')
    expect(clearBtn).toBeInTheDocument()

    await user.click(clearBtn)
    expect(handleClear).toHaveBeenCalledTimes(1)
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()

    render(<Input type="password" showPasswordToggle defaultValue="Secret123" />)
    const toggleBtn = screen.getByLabelText('Parolni ko‘rsatish')
    expect(toggleBtn).toBeInTheDocument()

    const input = screen.getByDisplayValue('Secret123')
    expect(input).toHaveAttribute('type', 'password')

    await user.click(toggleBtn)
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('Parolni yashirish')).toBeInTheDocument()
  })

  it('displays label and error message inside FormField', () => {
    render(
      <FormField label="Email" htmlFor="email-input" required error="Email noto‘g‘ri kiritildi">
        <Input id="email-input" error="Email noto‘g‘ri kiritildi" />
      </FormField>
    )

    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Email noto‘g‘ri kiritildi')
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })
})
