import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { toast } from '~/lib/toast'

import { Toaster, toastVariants } from './toaster'

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0)
    return 0
  })
  vi.stubGlobal('cancelAnimationFrame', () => {})
  toast.dismissAll()
})

afterEach(() => {
  toast.dismissAll()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function renderToasterAndAddToast(variant: 'success' | 'error' | 'info', message: string) {
  render(<Toaster />)
  act(() => {
    toast[variant](message)
  })
}

describe('Toaster', () => {
  it('renders empty ARIA section when no toasts exist', () => {
    render(<Toaster />)

    const section = screen.getByRole('region', { name: 'Notificações' })
    expect(section).toBeInTheDocument()

    const list = section.querySelector('ol')
    expect(list).toBeInTheDocument()
    expect(list?.children).toHaveLength(0)
  })

  it('renders toast message text after toast call', async () => {
    renderToasterAndAddToast('success', 'Link copiado!')

    await waitFor(() => {
      const matches = screen.getAllByText('Link copiado!')
      expect(matches.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('applies success variant classes', async () => {
    renderToasterAndAddToast('success', 'Operação concluída')

    await waitFor(() => {
      const toastItem = document.querySelector('[data-slot="toast-item"]')
      expect(toastItem).toHaveClass('border-success/30')
      expect(toastItem).toHaveClass('bg-success/10')
      expect(toastItem).toHaveClass('text-success')
    })
  })

  it('applies error variant classes', async () => {
    renderToasterAndAddToast('error', 'Algo deu errado')

    await waitFor(() => {
      const toastItem = document.querySelector('[data-slot="toast-item"]')
      expect(toastItem).toHaveClass('border-error/30')
      expect(toastItem).toHaveClass('bg-error/10')
      expect(toastItem).toHaveClass('text-error')
    })
  })

  it('applies info variant classes', async () => {
    renderToasterAndAddToast('info', 'Informação importante')

    await waitFor(() => {
      const toastItem = document.querySelector('[data-slot="toast-item"]')
      expect(toastItem).toHaveClass('border-info/30')
      expect(toastItem).toHaveClass('bg-info/10')
      expect(toastItem).toHaveClass('text-info')
    })
  })

  it('renders close button with aria-label="Fechar"', async () => {
    renderToasterAndAddToast('success', 'Mensagem')

    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: 'Fechar' })
      expect(closeButton).toBeInTheDocument()
    })
  })

  it('renders ARIA section with aria-label="Notificações"', () => {
    render(<Toaster />)

    const section = screen.getByRole('region', { name: 'Notificações' })
    expect(section).toHaveAttribute('aria-label', 'Notificações')
  })

  it('uses role="alert" for error toasts in the ARIA live region', async () => {
    renderToasterAndAddToast('error', 'Erro crítico')

    await waitFor(() => {
      const alertItem = screen.getByRole('alert')
      expect(alertItem).toHaveTextContent('Erro crítico')
    })
  })

  it('uses role="status" for success toasts in the ARIA live region', async () => {
    renderToasterAndAddToast('success', 'Sucesso!')

    await waitFor(() => {
      const statusItem = screen.getByRole('status')
      expect(statusItem).toHaveTextContent('Sucesso!')
    })
  })

  it('uses role="status" for info toasts in the ARIA live region', async () => {
    renderToasterAndAddToast('info', 'Nota informativa')

    await waitFor(() => {
      const statusItem = screen.getByRole('status')
      expect(statusItem).toHaveTextContent('Nota informativa')
    })
  })

  it('stacks multiple toasts simultaneously', async () => {
    render(<Toaster />)

    act(() => {
      toast.success('Primeira mensagem')
    })
    act(() => {
      toast.error('Segunda mensagem')
    })
    act(() => {
      toast.info('Terceira mensagem')
    })

    await waitFor(() => {
      const toastItems = document.querySelectorAll('[data-slot="toast-item"]')
      expect(toastItems).toHaveLength(3)
    })

    expect(screen.getAllByText('Primeira mensagem').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Segunda mensagem').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Terceira mensagem').length).toBeGreaterThanOrEqual(1)
  })

  it('renders multiple ARIA live region items with correct roles', async () => {
    render(<Toaster />)

    act(() => {
      toast.success('Sucesso')
    })
    act(() => {
      toast.error('Erro')
    })

    await waitFor(() => {
      const statusItems = screen.getAllByRole('status')
      const alertItems = screen.getAllByRole('alert')

      expect(statusItems).toHaveLength(1)
      expect(alertItems).toHaveLength(1)
      expect(statusItems[0]).toHaveTextContent('Sucesso')
      expect(alertItems[0]).toHaveTextContent('Erro')
    })
  })

  it('renders portal viewport in document.body', async () => {
    renderToasterAndAddToast('info', 'Portal test')

    await waitFor(() => {
      const viewport = document.querySelector('[data-slot="toaster-viewport"]')
      expect(viewport).toBeInTheDocument()
      expect(viewport?.parentElement).toBe(document.body)
    })
  })
})

describe('toastVariants', () => {
  it('generates success variant classes', () => {
    const classes = toastVariants({ variant: 'success' })
    expect(classes).toContain('border-success/30')
    expect(classes).toContain('bg-success/10')
    expect(classes).toContain('text-success')
  })

  it('generates error variant classes', () => {
    const classes = toastVariants({ variant: 'error' })
    expect(classes).toContain('border-error/30')
    expect(classes).toContain('bg-error/10')
    expect(classes).toContain('text-error')
  })

  it('generates info variant classes', () => {
    const classes = toastVariants({ variant: 'info' })
    expect(classes).toContain('border-info/30')
    expect(classes).toContain('bg-info/10')
    expect(classes).toContain('text-info')
  })

  it('defaults to info variant', () => {
    const classes = toastVariants()
    expect(classes).toContain('border-info/30')
    expect(classes).toContain('bg-info/10')
    expect(classes).toContain('text-info')
  })

  it('includes base classes for all variants', () => {
    const classes = toastVariants({ variant: 'success' })
    expect(classes).toContain('pointer-events-auto')
    expect(classes).toContain('rounded-lg')
    expect(classes).toContain('shadow-sm')
  })
})
