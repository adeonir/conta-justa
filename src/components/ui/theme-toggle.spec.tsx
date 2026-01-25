import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ThemeToggle } from './theme-toggle'

const mockSetTheme = vi.fn()

vi.mock('~/providers/theme-provider', () => ({
  useTheme: () => ({
    theme: 'system',
    resolvedTheme: 'dark',
    setTheme: mockSetTheme,
  }),
}))

vi.mock('~/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('ThemeToggle', () => {
  it('renders toggle button', () => {
    render(<ThemeToggle />)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('has correct aria-label for accessibility', () => {
    render(<ThemeToggle />)

    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Tema: Sistema. Clique para alternar')
  })

  it('cycles to next theme on click', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole('button'))

    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('has type="button" attribute', () => {
    render(<ThemeToggle />)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })
})
