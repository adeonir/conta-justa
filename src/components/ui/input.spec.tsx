import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Input } from './input'

describe('Input', () => {
  it('renders text input by default', () => {
    render(<Input />)

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input.tagName).toBe('INPUT')
    expect(input).not.toHaveAttribute('data-currency')
  })

  it('applies error styling when error prop is true', () => {
    render(<Input error />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('data-error', 'true')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not apply error attributes when error prop is false', () => {
    render(<Input />)

    const input = screen.getByRole('textbox')
    expect(input).not.toHaveAttribute('data-error')
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  describe('currency mode', () => {
    it('renders currency input when currency prop is true', () => {
      render(<Input currency />)

      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('data-currency')
    })

    it('formats value as BRL currency', async () => {
      const user = userEvent.setup()
      render(<Input currency />)

      const input = screen.getByRole('textbox') as HTMLInputElement
      await user.type(input, '4500')

      expect(input.value).toContain('4.500')
    })

    it('calls onValueChange with cents value', async () => {
      const user = userEvent.setup()
      const handleValueChange = vi.fn()
      render(<Input currency onValueChange={handleValueChange} />)

      const input = screen.getByRole('textbox')
      await user.type(input, '4500')

      expect(handleValueChange).toHaveBeenLastCalledWith(450000)
    })

    it('calls onValueChange with null when input is cleared', async () => {
      const user = userEvent.setup()
      const handleValueChange = vi.fn()
      render(<Input currency onValueChange={handleValueChange} />)

      const input = screen.getByRole('textbox')
      await user.type(input, '100')
      await user.clear(input)

      expect(handleValueChange).toHaveBeenLastCalledWith(null)
    })

    it('applies error styling in currency mode', () => {
      render(<Input currency error />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('data-error', 'true')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })
})
