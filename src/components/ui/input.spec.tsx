import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Input } from './input'

describe('Input', () => {
  it('renders text input by default', () => {
    render(<Input placeholder="Enter text" />)

    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input.tagName).toBe('INPUT')
    expect(input).not.toHaveAttribute('data-currency')
  })

  it('applies error styling when error prop is true', () => {
    render(<Input error placeholder="Error input" />)

    const input = screen.getByPlaceholderText('Error input')
    expect(input).toHaveAttribute('data-error', 'true')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not apply error attributes when error prop is false', () => {
    render(<Input placeholder="Normal input" />)

    const input = screen.getByPlaceholderText('Normal input')
    expect(input).not.toHaveAttribute('data-error')
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  describe('currency mode', () => {
    it('renders currency input when currency prop is true', () => {
      render(<Input currency placeholder="R$ 0,00" />)

      const input = screen.getByPlaceholderText('R$ 0,00')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('data-currency')
    })

    it('formats value as BRL currency', async () => {
      const user = userEvent.setup()
      render(<Input currency placeholder="R$ 0,00" />)

      const input = screen.getByPlaceholderText('R$ 0,00') as HTMLInputElement
      await user.type(input, '4500')

      expect(input.value).toContain('4.500')
    })

    it('calls onValueChange with cents value', async () => {
      const user = userEvent.setup()
      const handleValueChange = vi.fn()
      render(<Input currency onValueChange={handleValueChange} placeholder="R$ 0,00" />)

      const input = screen.getByPlaceholderText('R$ 0,00')
      await user.type(input, '4500')

      expect(handleValueChange).toHaveBeenLastCalledWith(450000)
    })

    it('calls onValueChange with null when input is cleared', async () => {
      const user = userEvent.setup()
      const handleValueChange = vi.fn()
      render(<Input currency onValueChange={handleValueChange} placeholder="R$ 0,00" />)

      const input = screen.getByPlaceholderText('R$ 0,00')
      await user.type(input, '100')
      await user.clear(input)

      expect(handleValueChange).toHaveBeenLastCalledWith(null)
    })

    it('applies error styling in currency mode', () => {
      render(<Input currency error placeholder="R$ 0,00" />)

      const input = screen.getByPlaceholderText('R$ 0,00')
      expect(input).toHaveAttribute('data-error', 'true')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })
})
