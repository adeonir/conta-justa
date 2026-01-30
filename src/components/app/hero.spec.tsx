import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Hero } from './hero'

describe('Hero', () => {
  it('renders children content', () => {
    render(
      <Hero>
        <h1>Test heading</h1>
      </Hero>,
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test heading')
  })

  it('merges custom className with default sticky classes', () => {
    const { container } = render(
      <Hero className="max-md:text-center">
        <p>Content</p>
      </Hero>,
    )

    const section = container.querySelector('section')
    expect(section).toHaveClass('sticky', 'top-42', 'self-start', 'max-lg:static', 'max-md:text-center')
  })
})
