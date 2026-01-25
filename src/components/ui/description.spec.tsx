import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Description } from './description'

describe('Description', () => {
  it('renders with default styling', () => {
    render(<Description>Helper text</Description>)

    expect(screen.getByText('Helper text')).toBeInTheDocument()
  })

  it('applies error styling when error prop is true', () => {
    render(<Description error>Error message</Description>)

    const element = screen.getByText('Error message')
    expect(element).toHaveAttribute('data-error', 'true')
    expect(element).toHaveClass('text-error')
  })

  it('does not apply error styling when error prop is false', () => {
    render(<Description>Normal text</Description>)

    const element = screen.getByText('Normal text')
    expect(element).not.toHaveAttribute('data-error')
    expect(element).not.toHaveClass('text-error')
  })
})
