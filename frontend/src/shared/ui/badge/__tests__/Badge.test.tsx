import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../Badge'

describe('Badge component', () => {
  it('renders badge label correctly', () => {
    render(<Badge>Faol</Badge>)
    expect(screen.getByText('Faol')).toBeInTheDocument()
  })

  it('renders with dot indicator when dot is true', () => {
    const { container } = render(
      <Badge variant="success" dot>
        Tasdiqlangan
      </Badge>
    )

    const dot = container.querySelector('span.rounded-full.bg-emerald-500')
    expect(dot).toBeInTheDocument()
  })

  it('renders with pulse animation on dot when dotPulse is true', () => {
    const { container } = render(
      <Badge variant="warning" dot dotPulse>
        Kutilmoqda
      </Badge>
    )

    const dot = container.querySelector('.animate-pulse')
    expect(dot).toBeInTheDocument()
  })
})
