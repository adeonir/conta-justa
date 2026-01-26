import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clearCache, fetchMinimumWage, getCache } from './get-minimum-wage'

vi.mock('~/schemas/env', () => ({
  env: { MINIMUM_WAGE: 1500 },
}))

describe('fetchMinimumWage', () => {
  beforeEach(() => {
    clearCache()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches minimum wage from BCB API', async () => {
    const mockResponse = [{ data: '01/01/2026', valor: '1621.00' }]
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    } as Response)

    const result = await fetchMinimumWage()

    expect(result).toBe(1621)
    expect(fetch).toHaveBeenCalledWith(
      'https://api.bcb.gov.br/dados/serie/bcdata.sgs.1619/dados/ultimos/1?formato=json',
    )
  })

  it('caches the result for the current year', async () => {
    const mockResponse = [{ data: '01/01/2026', valor: '1621.00' }]
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    } as Response)

    await fetchMinimumWage()
    await fetchMinimumWage()

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('returns cached value without fetching', async () => {
    const mockResponse = [{ data: '01/01/2026', valor: '1621.00' }]
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    } as Response)

    const firstCall = await fetchMinimumWage()
    const secondCall = await fetchMinimumWage()

    expect(firstCall).toBe(1621)
    expect(secondCall).toBe(1621)
    expect(getCache()).toEqual({ value: 1621, year: new Date().getFullYear() })
  })

  it('falls back to env var when API fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'))

    const result = await fetchMinimumWage()

    expect(result).toBe(1500)
  })

  it('falls back to env var when API returns invalid data', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: () => Promise.reject(new Error('Invalid JSON')),
    } as Response)

    const result = await fetchMinimumWage()

    expect(result).toBe(1500)
  })

  it('refetches when year changes', async () => {
    const mockResponse2025 = [{ data: '01/01/2025', valor: '1518.00' }]
    const mockResponse2026 = [{ data: '01/01/2026', valor: '1621.00' }]

    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse2025),
      } as Response)
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse2026),
      } as Response)

    const currentYear = new Date().getFullYear()
    vi.spyOn(Date.prototype, 'getFullYear').mockReturnValueOnce(currentYear - 1)

    await fetchMinimumWage()

    vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(currentYear)

    clearCache()
    const result = await fetchMinimumWage()

    expect(result).toBe(1621)
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
