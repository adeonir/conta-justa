import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useResults } from './use-results'

const mockSetSelectedMethod = vi.fn()

let mockStoreState = {
  data: null as {
    nameA: string
    incomeA: number
    nameB: string
    incomeB: number
    expenses: number
    houseworkA: number
    houseworkB: number
  } | null,
  minimumWage: null as number | null,
  selectedMethod: null as 'proportional' | 'equal' | null,
}

vi.mock('~/stores/expense-store', () => ({
  useData: () => mockStoreState.data,
  useMinimumWage: () => mockStoreState.minimumWage,
  useSelectedMethod: () => mockStoreState.selectedMethod,
  useSetSelectedMethod: () => mockSetSelectedMethod,
}))

describe('useResults', () => {
  beforeEach(() => {
    mockSetSelectedMethod.mockClear()
    mockStoreState = {
      data: null,
      minimumWage: null,
      selectedMethod: null,
    }
  })

  describe('when data is missing', () => {
    it('returns null when data is null', () => {
      mockStoreState.minimumWage = 141200

      const { result } = renderHook(() => useResults())

      expect(result.current).toBeNull()
    })

    it('returns null when minimumWage is null', () => {
      mockStoreState.data = {
        nameA: 'Ana',
        incomeA: 500000,
        nameB: 'Bob',
        incomeB: 300000,
        expenses: 200000,
        houseworkA: 0,
        houseworkB: 0,
      }

      const { result } = renderHook(() => useResults())

      expect(result.current).toBeNull()
    })
  })

  describe('when data is available', () => {
    beforeEach(() => {
      mockStoreState.minimumWage = 141200
      mockStoreState.data = {
        nameA: 'Ana',
        incomeA: 500000,
        nameB: 'Bob',
        incomeB: 300000,
        expenses: 200000,
        houseworkA: 0,
        houseworkB: 0,
      }
    })

    it('returns calculation results', () => {
      const { result } = renderHook(() => useResults())

      expect(result.current).not.toBeNull()
      expect(result.current?.proportional).toBeDefined()
      expect(result.current?.equal).toBeDefined()
    })

    it('calculates equal method (50/50 split)', () => {
      const { result } = renderHook(() => useResults())

      expect(result.current?.equal.personA.contribution).toBe(100000)
      expect(result.current?.equal.personB.contribution).toBe(100000)
    })

    it('calculates proportional contributions based on income ratio (no housework)', () => {
      const { result } = renderHook(() => useResults())

      expect(result.current?.proportional.personA.contribution).toBe(125000)
      expect(result.current?.proportional.personB.contribution).toBe(75000)
    })

    it('has hasHousework false when no housework', () => {
      const { result } = renderHook(() => useResults())

      expect(result.current?.hasHousework).toBe(false)
    })

    it('always recommends proportional', () => {
      const { result } = renderHook(() => useResults())

      expect(result.current?.recommendedMethod).toBe('proportional')
    })

    it('uses recommendedMethod as activeMethod when selectedMethod is null', () => {
      const { result } = renderHook(() => useResults())

      expect(result.current?.activeMethod).toBe('proportional')
      expect(result.current?.activeResult).toEqual(result.current?.proportional)
    })

    it('isRecommended is true when activeMethod matches recommendedMethod', () => {
      const { result } = renderHook(() => useResults())

      expect(result.current?.isRecommended).toBe(true)
    })

    it('provides setSelectedMethod function', () => {
      const { result } = renderHook(() => useResults())

      expect(result.current?.setSelectedMethod).toBe(mockSetSelectedMethod)
    })
  })

  describe('names property', () => {
    beforeEach(() => {
      mockStoreState.minimumWage = 141200
      mockStoreState.data = {
        nameA: 'Ana',
        incomeA: 500000,
        nameB: 'Bob',
        incomeB: 300000,
        expenses: 200000,
        houseworkA: 0,
        houseworkB: 0,
      }
    })

    it('returns names from data', () => {
      const { result } = renderHook(() => useResults())

      expect(result.current?.names.nameA).toBe('Ana')
      expect(result.current?.names.nameB).toBe('Bob')
    })

    it('returns default names when data names are empty', () => {
      mockStoreState.data = {
        nameA: '',
        incomeA: 500000,
        nameB: '',
        incomeB: 300000,
        expenses: 200000,
        houseworkA: 0,
        houseworkB: 0,
      }

      const { result } = renderHook(() => useResults())

      expect(result.current?.names.nameA).toBe('Pessoa A')
      expect(result.current?.names.nameB).toBe('Pessoa B')
    })
  })

  describe('when housework is present', () => {
    beforeEach(() => {
      mockStoreState.minimumWage = 141200
      mockStoreState.data = {
        nameA: 'Ana',
        incomeA: 500000,
        nameB: 'Bob',
        incomeB: 300000,
        expenses: 200000,
        houseworkA: 10,
        houseworkB: 5,
      }
    })

    it('has hasHousework true', () => {
      const { result } = renderHook(() => useResults())

      expect(result.current?.hasHousework).toBe(true)
    })

    it('still recommends proportional (which now uses adjusted calculation internally)', () => {
      const { result } = renderHook(() => useResults())

      expect(result.current?.recommendedMethod).toBe('proportional')
    })

    it('uses proportional as activeResult which contains adjusted values', () => {
      const { result } = renderHook(() => useResults())

      expect(result.current?.activeMethod).toBe('proportional')
      expect(result.current?.activeResult).toEqual(result.current?.proportional)
      expect(result.current?.activeResult.method).toBe('proportional')
    })

    it('proportional result uses adjusted calculation when housework is present', () => {
      const { result } = renderHook(() => useResults())

      // With housework, Person A (10hrs) contributes more housework value
      // This should result in different values than simple proportional
      // Simple proportional: A=125000, B=75000
      // Adjusted should differ based on housework hours
      expect(result.current?.proportional.personA.contribution).not.toBe(125000)
    })
  })

  describe('when selectedMethod is set', () => {
    beforeEach(() => {
      mockStoreState.minimumWage = 141200
      mockStoreState.data = {
        nameA: 'Ana',
        incomeA: 500000,
        nameB: 'Bob',
        incomeB: 300000,
        expenses: 200000,
        houseworkA: 10,
        houseworkB: 5,
      }
    })

    it('uses selectedMethod as activeMethod', () => {
      mockStoreState.selectedMethod = 'proportional'

      const { result } = renderHook(() => useResults())

      expect(result.current?.activeMethod).toBe('proportional')
      expect(result.current?.activeResult).toEqual(result.current?.proportional)
    })

    it('uses equal when selected', () => {
      mockStoreState.selectedMethod = 'equal'

      const { result } = renderHook(() => useResults())

      expect(result.current?.activeMethod).toBe('equal')
      expect(result.current?.activeResult).toEqual(result.current?.equal)
    })

    it('isRecommended is false for equal method', () => {
      mockStoreState.selectedMethod = 'equal'

      const { result } = renderHook(() => useResults())

      expect(result.current?.isRecommended).toBe(false)
    })

    it('isRecommended is true when proportional is selected', () => {
      mockStoreState.selectedMethod = 'proportional'

      const { result } = renderHook(() => useResults())

      expect(result.current?.recommendedMethod).toBe('proportional')
      expect(result.current?.activeMethod).toBe('proportional')
      expect(result.current?.isRecommended).toBe(true)
    })
  })

  describe('edge cases', () => {
    beforeEach(() => {
      mockStoreState.minimumWage = 141200
    })

    it('handles equal incomes', () => {
      mockStoreState.data = {
        nameA: 'Ana',
        incomeA: 400000,
        nameB: 'Bob',
        incomeB: 400000,
        expenses: 200000,
        houseworkA: 0,
        houseworkB: 0,
      }

      const { result } = renderHook(() => useResults())

      expect(result.current?.proportional.personA.contribution).toBe(100000)
      expect(result.current?.proportional.personB.contribution).toBe(100000)
    })

    it('handles only one person with housework', () => {
      mockStoreState.data = {
        nameA: 'Ana',
        incomeA: 500000,
        nameB: 'Bob',
        incomeB: 300000,
        expenses: 200000,
        houseworkA: 20,
        houseworkB: 0,
      }

      const { result } = renderHook(() => useResults())

      expect(result.current?.hasHousework).toBe(true)
      // Proportional should use adjusted calculation
      expect(result.current?.proportional.method).toBe('proportional')
    })
  })
})
