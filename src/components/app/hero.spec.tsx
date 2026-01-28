import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Hero } from './hero'

describe('Hero', () => {
  it('renders headline with correct Portuguese text', () => {
    render(<Hero />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Compare modelos de divisão justa das contas do casal',
    )
  })

  it('renders subheadline', () => {
    render(<Hero />)

    expect(screen.getByText(/Veja como diferentes formas de dividir despesas/)).toBeInTheDocument()
  })
})
