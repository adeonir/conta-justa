import { renderHook } from '@testing-library/react'
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useExpenseStore } from '~/stores/expense-store'

import { useShareParams } from './use-share-params'

describe('useShareParams', () => {
  beforeEach(() => {
    useExpenseStore.setState({ data: null })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('valid params', () => {
    it('returns isFromShareLink true and populates store with valid params', () => {
      const { result } = renderHook(() => useShareParams(), {
        wrapper: withNuqsTestingAdapter({
          searchParams: 'a=Maria&ra=450000&b=Joao&rb=300000&e=200000',
        }),
      })

      expect(result.current.isFromShareLink).toBe(true)
      expect(useExpenseStore.getState().data).toEqual({
        nameA: 'Maria',
        incomeA: 450000,
        nameB: 'Joao',
        incomeB: 300000,
        expenses: 200000,
        houseworkA: 0,
        houseworkB: 0,
      })
    })

    it('parses housework params when present', () => {
      const { result } = renderHook(() => useShareParams(), {
        wrapper: withNuqsTestingAdapter({
          searchParams: 'a=Maria&ra=450000&b=Joao&rb=300000&e=200000&ha=10&hb=5',
        }),
      })

      expect(result.current.isFromShareLink).toBe(true)
      expect(useExpenseStore.getState().data).toEqual({
        nameA: 'Maria',
        incomeA: 450000,
        nameB: 'Joao',
        incomeB: 300000,
        expenses: 200000,
        houseworkA: 10,
        houseworkB: 5,
      })
    })

    it('defaults housework to 0 when ha and hb are absent', () => {
      renderHook(() => useShareParams(), {
        wrapper: withNuqsTestingAdapter({
          searchParams: 'a=Ana&ra=100000&b=Bob&rb=200000&e=150000',
        }),
      })

      const data = useExpenseStore.getState().data
      expect(data?.houseworkA).toBe(0)
      expect(data?.houseworkB).toBe(0)
    })

    it('does not re-process on re-render', () => {
      const setDataSpy = vi.fn()
      const originalSetData = useExpenseStore.getState().setData
      useExpenseStore.setState({
        setData: (d) => {
          setDataSpy(d)
          originalSetData(d)
        },
      })

      const { rerender } = renderHook(() => useShareParams(), {
        wrapper: withNuqsTestingAdapter({
          searchParams: 'a=Maria&ra=450000&b=Joao&rb=300000&e=200000',
        }),
      })

      const callCount = setDataSpy.mock.calls.length

      rerender()
      rerender()

      expect(setDataSpy.mock.calls.length).toBe(callCount)

      useExpenseStore.setState({ setData: originalSetData })
    })
  })

  describe('missing required params', () => {
    it('returns isFromShareLink false and hasInvalidShareParams false when no params', () => {
      const { result } = renderHook(() => useShareParams(), {
        wrapper: withNuqsTestingAdapter({ searchParams: '' }),
      })

      expect(result.current.isFromShareLink).toBe(false)
      expect(result.current.hasInvalidShareParams).toBe(false)
      expect(useExpenseStore.getState().data).toBeNull()
    })

    it('returns hasInvalidShareParams true when name a is missing', () => {
      const { result } = renderHook(() => useShareParams(), {
        wrapper: withNuqsTestingAdapter({
          searchParams: 'ra=450000&b=Joao&rb=300000&e=200000',
        }),
      })

      expect(result.current.isFromShareLink).toBe(false)
      expect(result.current.hasInvalidShareParams).toBe(true)
      expect(useExpenseStore.getState().data).toBeNull()
    })

    it('returns hasInvalidShareParams true when expenses is missing', () => {
      const { result } = renderHook(() => useShareParams(), {
        wrapper: withNuqsTestingAdapter({
          searchParams: 'a=Maria&ra=450000&b=Joao&rb=300000',
        }),
      })

      expect(result.current.isFromShareLink).toBe(false)
      expect(result.current.hasInvalidShareParams).toBe(true)
      expect(useExpenseStore.getState().data).toBeNull()
    })
  })

  describe('invalid params', () => {
    it('returns isFromShareLink false with negative income', () => {
      const { result } = renderHook(() => useShareParams(), {
        wrapper: withNuqsTestingAdapter({
          searchParams: 'a=Maria&ra=-100&b=Joao&rb=300000&e=200000',
        }),
      })

      expect(result.current.isFromShareLink).toBe(false)
      expect(useExpenseStore.getState().data).toBeNull()
    })

    it('returns isFromShareLink false with zero income', () => {
      const { result } = renderHook(() => useShareParams(), {
        wrapper: withNuqsTestingAdapter({
          searchParams: 'a=Maria&ra=0&b=Joao&rb=300000&e=200000',
        }),
      })

      expect(result.current.isFromShareLink).toBe(false)
      expect(useExpenseStore.getState().data).toBeNull()
    })

    it('returns isFromShareLink false with empty name', () => {
      const { result } = renderHook(() => useShareParams(), {
        wrapper: withNuqsTestingAdapter({
          searchParams: 'a=&ra=450000&b=Joao&rb=300000&e=200000',
        }),
      })

      expect(result.current.isFromShareLink).toBe(false)
      expect(useExpenseStore.getState().data).toBeNull()
    })

    it('returns isFromShareLink false with whitespace-only name', () => {
      const { result } = renderHook(() => useShareParams(), {
        wrapper: withNuqsTestingAdapter({
          searchParams: 'a=%20%20&ra=450000&b=Joao&rb=300000&e=200000',
        }),
      })

      expect(result.current.isFromShareLink).toBe(false)
      expect(useExpenseStore.getState().data).toBeNull()
    })
  })
})
