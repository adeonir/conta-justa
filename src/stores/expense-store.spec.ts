import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useExpenseStore } from './expense-store'

const mockFormData = {
  nameA: 'Ana',
  incomeA: 500000,
  nameB: 'Bob',
  incomeB: 300000,
  expenses: 200000,
  houseworkA: 10,
  houseworkB: 5,
}

describe('expense-store', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useExpenseStore())
    act(() => {
      result.current.reset()
      useExpenseStore.setState({
        data: null,
        minimumWage: null,
        selectedMethod: null,
        _hasHydrated: false,
      })
    })
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('setData', () => {
    it('updates data state', () => {
      const { result } = renderHook(() => useExpenseStore())

      act(() => {
        result.current.setData(mockFormData)
      })

      expect(result.current.data).toEqual(mockFormData)
    })

    it('persists data to sessionStorage', () => {
      const { result } = renderHook(() => useExpenseStore())

      act(() => {
        result.current.setData(mockFormData)
      })

      const stored = JSON.parse(sessionStorage.getItem('expense-storage') || '{}')
      expect(stored.state.data).toEqual(mockFormData)
    })
  })

  describe('setMinimumWage', () => {
    it('updates minimumWage state', () => {
      const { result } = renderHook(() => useExpenseStore())

      act(() => {
        result.current.setMinimumWage(141200)
      })

      expect(result.current.minimumWage).toBe(141200)
    })

    it('persists minimumWage to sessionStorage', () => {
      const { result } = renderHook(() => useExpenseStore())

      act(() => {
        result.current.setMinimumWage(141200)
      })

      const stored = JSON.parse(sessionStorage.getItem('expense-storage') || '{}')
      expect(stored.state.minimumWage).toBe(141200)
    })
  })

  describe('setSelectedMethod', () => {
    it('updates selectedMethod state', () => {
      const { result } = renderHook(() => useExpenseStore())

      act(() => {
        result.current.setSelectedMethod('proportional')
      })

      expect(result.current.selectedMethod).toBe('proportional')
    })

    it('can set selectedMethod to null', () => {
      const { result } = renderHook(() => useExpenseStore())

      act(() => {
        result.current.setSelectedMethod('hybrid')
      })

      expect(result.current.selectedMethod).toBe('hybrid')

      act(() => {
        result.current.setSelectedMethod(null)
      })

      expect(result.current.selectedMethod).toBeNull()
    })

    it('does not persist selectedMethod to sessionStorage', () => {
      const { result } = renderHook(() => useExpenseStore())

      act(() => {
        result.current.setSelectedMethod('adjusted')
      })

      const stored = JSON.parse(sessionStorage.getItem('expense-storage') || '{}')
      expect(stored.state.selectedMethod).toBeUndefined()
    })
  })

  describe('reset', () => {
    it('clears data state', () => {
      const { result } = renderHook(() => useExpenseStore())

      act(() => {
        result.current.setData(mockFormData)
      })

      expect(result.current.data).toEqual(mockFormData)

      act(() => {
        result.current.reset()
      })

      expect(result.current.data).toBeNull()
    })

    it('clears selectedMethod state', () => {
      const { result } = renderHook(() => useExpenseStore())

      act(() => {
        result.current.setSelectedMethod('hybrid')
      })

      expect(result.current.selectedMethod).toBe('hybrid')

      act(() => {
        result.current.reset()
      })

      expect(result.current.selectedMethod).toBeNull()
    })

    it('clears data from sessionStorage', () => {
      const { result } = renderHook(() => useExpenseStore())

      act(() => {
        result.current.setData(mockFormData)
        result.current.setMinimumWage(141200)
      })

      const storedBefore = JSON.parse(sessionStorage.getItem('expense-storage') || '{}')
      expect(storedBefore.state.data).toEqual(mockFormData)

      act(() => {
        result.current.reset()
      })

      const storedAfter = JSON.parse(sessionStorage.getItem('expense-storage') || '{}')
      expect(storedAfter.state.data).toBeNull()
    })

    it('preserves minimumWage in state after reset', () => {
      const { result } = renderHook(() => useExpenseStore())

      act(() => {
        result.current.setMinimumWage(141200)
        result.current.setData(mockFormData)
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.minimumWage).toBe(141200)
    })
  })

  describe('partialize', () => {
    it('only persists data and minimumWage', () => {
      const { result } = renderHook(() => useExpenseStore())

      act(() => {
        result.current.setData(mockFormData)
        result.current.setMinimumWage(141200)
        result.current.setSelectedMethod('hybrid')
      })

      const stored = JSON.parse(sessionStorage.getItem('expense-storage') || '{}')

      expect(stored.state).toHaveProperty('data')
      expect(stored.state).toHaveProperty('minimumWage')
      expect(stored.state).not.toHaveProperty('selectedMethod')
      expect(stored.state).not.toHaveProperty('_hasHydrated')
    })

    it('excludes functions from persistence', () => {
      const { result } = renderHook(() => useExpenseStore())

      act(() => {
        result.current.setData(mockFormData)
      })

      const stored = JSON.parse(sessionStorage.getItem('expense-storage') || '{}')

      expect(stored.state).not.toHaveProperty('setData')
      expect(stored.state).not.toHaveProperty('setMinimumWage')
      expect(stored.state).not.toHaveProperty('setSelectedMethod')
      expect(stored.state).not.toHaveProperty('reset')
    })
  })

  describe('hydration', () => {
    it('sets _hasHydrated to true after rehydration', async () => {
      sessionStorage.setItem(
        'expense-storage',
        JSON.stringify({
          state: { data: mockFormData, minimumWage: 141200 },
          version: 0,
        }),
      )

      useExpenseStore.persist.rehydrate()

      await vi.waitFor(() => {
        expect(useExpenseStore.getState()._hasHydrated).toBe(true)
      })
    })

    it('restores data from sessionStorage', async () => {
      sessionStorage.setItem(
        'expense-storage',
        JSON.stringify({
          state: { data: mockFormData, minimumWage: 141200 },
          version: 0,
        }),
      )

      useExpenseStore.persist.rehydrate()

      await vi.waitFor(() => {
        expect(useExpenseStore.getState().data).toEqual(mockFormData)
      })
    })

    it('restores minimumWage from sessionStorage', async () => {
      sessionStorage.setItem(
        'expense-storage',
        JSON.stringify({
          state: { data: mockFormData, minimumWage: 141200 },
          version: 0,
        }),
      )

      useExpenseStore.persist.rehydrate()

      await vi.waitFor(() => {
        expect(useExpenseStore.getState().minimumWage).toBe(141200)
      })
    })
  })

  describe('initial state', () => {
    it('starts with null data', () => {
      expect(useExpenseStore.getState().data).toBeNull()
    })

    it('starts with null minimumWage', () => {
      expect(useExpenseStore.getState().minimumWage).toBeNull()
    })

    it('starts with null selectedMethod', () => {
      expect(useExpenseStore.getState().selectedMethod).toBeNull()
    })

    it('starts with _hasHydrated as false', () => {
      useExpenseStore.setState({ _hasHydrated: false })
      expect(useExpenseStore.getState()._hasHydrated).toBe(false)
    })
  })
})
