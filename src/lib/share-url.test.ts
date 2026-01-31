import { describe, expect, it } from 'vitest'
import { buildShareUrl } from './share-url'

const baseUrl = 'https://contajusta.com'

describe('buildShareUrl', () => {
  it('should encode all fields when housework is present', () => {
    const data = {
      nameA: 'Maria',
      incomeA: 450000,
      nameB: 'João',
      incomeB: 300000,
      expenses: 200000,
      houseworkA: 10,
      houseworkB: 5,
    }

    const url = buildShareUrl(data, baseUrl)

    expect(url).toBe('https://contajusta.com/results?a=Maria&ra=450000&b=Jo%C3%A3o&rb=300000&e=200000&ha=10&hb=5')
  })

  it('should omit housework params when both are zero', () => {
    const data = {
      nameA: 'Ana',
      incomeA: 500000,
      nameB: 'Carlos',
      incomeB: 350000,
      expenses: 150000,
      houseworkA: 0,
      houseworkB: 0,
    }

    const url = buildShareUrl(data, baseUrl)
    const params = new URL(url).searchParams

    expect(params.has('ha')).toBe(false)
    expect(params.has('hb')).toBe(false)
    expect(params.get('a')).toBe('Ana')
    expect(params.get('ra')).toBe('500000')
    expect(params.get('b')).toBe('Carlos')
    expect(params.get('rb')).toBe('350000')
    expect(params.get('e')).toBe('150000')
  })

  it('should omit only the zero housework param', () => {
    const data = {
      nameA: 'Maria',
      incomeA: 450000,
      nameB: 'João',
      incomeB: 300000,
      expenses: 200000,
      houseworkA: 15,
      houseworkB: 0,
    }

    const url = buildShareUrl(data, baseUrl)
    const params = new URL(url).searchParams

    expect(params.get('ha')).toBe('15')
    expect(params.has('hb')).toBe(false)
  })

  it('should handle special characters in names via URL encoding', () => {
    const data = {
      nameA: 'José & Maria',
      incomeA: 100000,
      nameB: 'João da Silva',
      incomeB: 200000,
      expenses: 100000,
      houseworkA: 0,
      houseworkB: 0,
    }

    const url = buildShareUrl(data, baseUrl)
    const params = new URL(url).searchParams

    expect(params.get('a')).toBe('José & Maria')
    expect(params.get('b')).toBe('João da Silva')
  })

  it('should handle empty names', () => {
    const data = {
      nameA: '',
      incomeA: 100000,
      nameB: '',
      incomeB: 200000,
      expenses: 100000,
      houseworkA: 0,
      houseworkB: 0,
    }

    const url = buildShareUrl(data, baseUrl)
    const params = new URL(url).searchParams

    expect(params.get('a')).toBe('')
    expect(params.get('b')).toBe('')
  })

  it('should use the provided base URL', () => {
    const data = {
      nameA: 'A',
      incomeA: 100,
      nameB: 'B',
      incomeB: 200,
      expenses: 100,
      houseworkA: 0,
      houseworkB: 0,
    }

    const url = buildShareUrl(data, 'https://example.com')

    expect(url.startsWith('https://example.com/results?')).toBe(true)
  })

  it('should produce a URL with /results path', () => {
    const data = {
      nameA: 'A',
      incomeA: 100,
      nameB: 'B',
      incomeB: 200,
      expenses: 100,
      houseworkA: 0,
      houseworkB: 0,
    }

    const url = buildShareUrl(data, baseUrl)
    const parsed = new URL(url)

    expect(parsed.pathname).toBe('/results')
  })
})
