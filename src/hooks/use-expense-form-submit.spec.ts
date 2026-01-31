import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useExpenseFormSubmit } from './use-expense-form-submit'

const mockNavigate = vi.fn()
const mockSetData = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('~/stores/expense-store', () => ({
  useSetData: () => mockSetData,
}))

describe('useExpenseFormSubmit', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockSetData.mockClear()
  })

  it('returns a function', () => {
    const { result } = renderHook(() => useExpenseFormSubmit())

    expect(typeof result.current).toBe('function')
  })

  it('saves form data to store and navigates to /results', () => {
    const { result } = renderHook(() => useExpenseFormSubmit())

    const formData = {
      nameA: 'Ana',
      incomeA: 500000,
      nameB: 'Bob',
      incomeB: 300000,
      expenses: 200000,
      houseworkA: 0,
      houseworkB: 0,
    }

    result.current(formData)

    expect(mockSetData).toHaveBeenCalledTimes(1)
    expect(mockSetData).toHaveBeenCalledWith(formData)
    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/results' })
  })

  it('handles form data with housework values', () => {
    const { result } = renderHook(() => useExpenseFormSubmit())

    const formData = {
      nameA: 'Ana',
      incomeA: 500000,
      nameB: 'Bob',
      incomeB: 300000,
      expenses: 200000,
      houseworkA: 15,
      houseworkB: 5,
    }

    result.current(formData)

    expect(mockSetData).toHaveBeenCalledWith(formData)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/results' })
  })

  it('handles empty names', () => {
    const { result } = renderHook(() => useExpenseFormSubmit())

    const formData = {
      nameA: '',
      incomeA: 100000,
      nameB: '',
      incomeB: 100000,
      expenses: 50000,
      houseworkA: 0,
      houseworkB: 0,
    }

    result.current(formData)

    expect(mockSetData).toHaveBeenCalledWith(formData)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/results' })
  })

  it('handles zero values', () => {
    const { result } = renderHook(() => useExpenseFormSubmit())

    const formData = {
      nameA: 'A',
      incomeA: 0,
      nameB: 'B',
      incomeB: 0,
      expenses: 0,
      houseworkA: 0,
      houseworkB: 0,
    }

    result.current(formData)

    expect(mockSetData).toHaveBeenCalledWith(formData)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/results' })
  })
})
