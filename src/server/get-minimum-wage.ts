import { createServerFn } from '@tanstack/react-start'

import { env } from '~/schemas/env'

const BCB_API_URL = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.1619/dados/ultimos/1?formato=json'

type CacheEntry = { value: number; year: number }

let cache: CacheEntry | null = null

export function clearCache() {
  cache = null
}

export function getCache(): CacheEntry | null {
  return cache
}

export async function fetchMinimumWage(): Promise<number> {
  const currentYear = new Date().getFullYear()

  if (cache && cache.year === currentYear) {
    return cache.value
  }

  try {
    const response = await fetch(BCB_API_URL)
    const data = await response.json()
    const value = Number.parseFloat(data[0].valor)
    cache = { value, year: currentYear }
    return value
  } catch {
    return env.MINIMUM_WAGE
  }
}

export const getMinimumWage = createServerFn().handler(fetchMinimumWage)
