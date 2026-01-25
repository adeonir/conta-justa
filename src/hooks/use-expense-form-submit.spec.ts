import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useExpenseFormSubmit } from './use-expense-form-submit'

describe('useExpenseFormSubmit', () => {
  const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

  beforeEach(() => {
    consoleSpy.mockClear()
  })

  it('returns a function', () => {
    const { result } = renderHook(() => useExpenseFormSubmit())

    expect(typeof result.current).toBe('function')
  })

  it('logs form data with correct query params', () => {
    const { result } = renderHook(() => useExpenseFormSubmit())

    result.current({
      nameA: 'Alice',
      incomeA: 500000,
      nameB: 'Bob',
      incomeB: 300000,
      expenses: 200000,
    })

    expect(consoleSpy).toHaveBeenCalledTimes(1)
    expect(consoleSpy).toHaveBeenCalledWith(
      'Form submitted:',
      'a=Alice&ra=500000&b=Bob&rb=300000&d=200000'
    )
  })

  it('handles empty names', () => {
    const { result } = renderHook(() => useExpenseFormSubmit())

    result.current({
      nameA: '',
      incomeA: 100000,
      nameB: '',
      incomeB: 100000,
      expenses: 50000,
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      'Form submitted:',
      'a=&ra=100000&b=&rb=100000&d=50000'
    )
  })

  it('handles zero values', () => {
    const { result } = renderHook(() => useExpenseFormSubmit())

    result.current({
      nameA: 'A',
      incomeA: 0,
      nameB: 'B',
      incomeB: 0,
      expenses: 0,
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      'Form submitted:',
      'a=A&ra=0&b=B&rb=0&d=0'
    )
  })
})
