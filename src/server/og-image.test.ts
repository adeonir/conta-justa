import { describe, expect, it, vi } from 'vitest'

import { generateOgImage, parseShareParams } from './og-image'

vi.mock('~/schemas/env', () => ({
  env: { MINIMUM_WAGE: 1621 },
}))

describe('parseShareParams', () => {
  it('parses valid params with all fields', () => {
    const params = new URLSearchParams('a=Maria&b=Joao&ra=450000&rb=300000&e=200000&ha=10&hb=5')
    const result = parseShareParams(params)

    expect(result).toEqual({
      nameA: 'Maria',
      nameB: 'Joao',
      incomeA: 450000,
      incomeB: 300000,
      expenses: 200000,
      houseworkA: 10,
      houseworkB: 5,
    })
  })

  it('parses params without housework (defaults to 0)', () => {
    const params = new URLSearchParams('a=Ana&b=Bob&ra=500000&rb=300000&e=200000')
    const result = parseShareParams(params)

    expect(result).toEqual({
      nameA: 'Ana',
      nameB: 'Bob',
      incomeA: 500000,
      incomeB: 300000,
      expenses: 200000,
      houseworkA: 0,
      houseworkB: 0,
    })
  })

  it('returns null when required params are missing', () => {
    expect(parseShareParams(new URLSearchParams('a=Maria&b=Joao'))).toBeNull()
    expect(parseShareParams(new URLSearchParams('a=Maria&ra=100&rb=100&e=100'))).toBeNull()
    expect(parseShareParams(new URLSearchParams(''))).toBeNull()
  })

  it('returns null when numeric params are not valid numbers', () => {
    const params = new URLSearchParams('a=Maria&b=Joao&ra=abc&rb=300000&e=200000')
    expect(parseShareParams(params)).toBeNull()
  })

  it('truncates names longer than 50 characters', () => {
    const longName = 'A'.repeat(100)
    const params = new URLSearchParams(`a=${longName}&b=Bob&ra=100&rb=100&e=100`)
    const result = parseShareParams(params)

    expect(result?.nameA).toHaveLength(50)
  })
})

describe('generateOgImage', () => {
  it('produces a valid PNG buffer for valid params', async () => {
    const params = new URLSearchParams('a=Maria&b=Joao&ra=450000&rb=300000&e=200000')
    const png = await generateOgImage(params)

    expect(png.length).toBeGreaterThan(0)
    // PNG magic bytes: 137 80 78 71 (0x89 P N G)
    expect(png[0]).toBe(0x89)
    expect(png[1]).toBe(0x50)
    expect(png[2]).toBe(0x4e)
    expect(png[3]).toBe(0x47)
  })

  it('produces a valid PNG fallback for missing params', async () => {
    const params = new URLSearchParams('')
    const png = await generateOgImage(params)

    expect(png[0]).toBe(0x89)
    expect(png[1]).toBe(0x50)
    expect(png[2]).toBe(0x4e)
    expect(png[3]).toBe(0x47)
  })

  it('produces a valid PNG for params with housework', { timeout: 10_000 }, async () => {
    const params = new URLSearchParams('a=Ana&b=Bob&ra=500000&rb=300000&e=200000&ha=15&hb=5')
    const png = await generateOgImage(params)

    expect(png[0]).toBe(0x89)
  })
})
