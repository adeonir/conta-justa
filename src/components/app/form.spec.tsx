import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Form } from './form'

describe('Form', () => {
  it('renders all three form sections', () => {
    render(<Form />)

    expect(screen.getByText('Pessoa A')).toBeInTheDocument()
    expect(screen.getByText('Pessoa B')).toBeInTheDocument()
    expect(screen.getByText('Despesas compartilhadas')).toBeInTheDocument()
  })

  it('renders submit button with type="button"', () => {
    render(<Form />)

    const button = screen.getByRole('button', { name: 'Calcular divisão' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'button')
  })

  it('renders name and income fields for both persons', () => {
    render(<Form />)

    expect(screen.getByLabelText('Nome', { selector: '#nameA' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nome', { selector: '#nameB' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ex: Maria')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ex: João')).toBeInTheDocument()
  })

  it('renders expenses section with helper text', () => {
    render(<Form />)

    expect(screen.getByLabelText('Total mensal')).toBeInTheDocument()
    expect(screen.getByText('Aluguel, contas, mercado, etc.')).toBeInTheDocument()
  })
})
