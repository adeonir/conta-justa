import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useExpenseFormSubmit } from './use-expense-form-submit'

const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

describe('useExpenseFormSubmit', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('returns a function', () => {
    const { result } = renderHook(() => useExpenseFormSubmit())

    expect(typeof result.current).toBe('function')
  })

  it('navigates to /resultado with correct query params', () => {
    const { result } = renderHook(() => useExpenseFormSubmit())

    result.current({
      nameA: 'Ana',
      incomeA: 500000,
      nameB: 'Bob',
      incomeB: 300000,
      expenses: 200000,
      houseworkA: 0,
      houseworkB: 0,
    })

    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/resultado?a=Ana&ra=500000&b=Bob&rb=300000&d=200000',
    })
  })

  it('handles empty names', () => {
    const { result } = renderHook(() => useExpenseFormSubmit())

    result.current({
      nameA: '',
      incomeA: 100000,
      nameB: '',
      incomeB: 100000,
      expenses: 50000,
      houseworkA: 0,
      houseworkB: 0,
    })

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/resultado?a=&ra=100000&b=&rb=100000&d=50000',
    })
  })

  it('handles zero values', () => {
    const { result } = renderHook(() => useExpenseFormSubmit())

    result.current({
      nameA: 'A',
      incomeA: 0,
      nameB: 'B',
      incomeB: 0,
      expenses: 0,
      houseworkA: 0,
      houseworkB: 0,
    })

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/resultado?a=A&ra=0&b=B&rb=0&d=0',
    })
  })

  it('includes ha and hb params when housework is provided', () => {
    const { result } = renderHook(() => useExpenseFormSubmit())

    result.current({
      nameA: 'Ana',
      incomeA: 500000,
      nameB: 'Bob',
      incomeB: 300000,
      expenses: 200000,
      houseworkA: 15,
      houseworkB: 5,
    })

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/resultado?a=Ana&ra=500000&b=Bob&rb=300000&d=200000&ha=15&hb=5',
    })
  })

  it('excludes ha param when houseworkA is zero', () => {
    const { result } = renderHook(() => useExpenseFormSubmit())

    result.current({
      nameA: 'Ana',
      incomeA: 500000,
      nameB: 'Bob',
      incomeB: 300000,
      expenses: 200000,
      houseworkA: 0,
      houseworkB: 10,
    })

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/resultado?a=Ana&ra=500000&b=Bob&rb=300000&d=200000&hb=10',
    })
  })

  it('excludes hb param when houseworkB is zero', () => {
    const { result } = renderHook(() => useExpenseFormSubmit())

    result.current({
      nameA: 'Ana',
      incomeA: 500000,
      nameB: 'Bob',
      incomeB: 300000,
      expenses: 200000,
      houseworkA: 20,
      houseworkB: 0,
    })

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/resultado?a=Ana&ra=500000&b=Bob&rb=300000&d=200000&ha=20',
    })
  })

  it('excludes ha and hb params when both housework values are zero', () => {
    const { result } = renderHook(() => useExpenseFormSubmit())

    result.current({
      nameA: 'Ana',
      incomeA: 500000,
      nameB: 'Bob',
      incomeB: 300000,
      expenses: 200000,
      houseworkA: 0,
      houseworkB: 0,
    })

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/resultado?a=Ana&ra=500000&b=Bob&rb=300000&d=200000',
    })
  })
})
