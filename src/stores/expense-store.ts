import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { MethodType } from '~/components/app/results/types'
import type { ExpenseFormData } from '~/schemas/expense-form'

interface ExpenseStateProps {
  data: ExpenseFormData | null
  minimumWage: number | null
  selectedMethod: MethodType | null
  includeHousework: boolean
  _hasHydrated: boolean
}

interface ExpenseStateActions {
  setData: (data: ExpenseFormData) => void
  setMinimumWage: (wage: number) => void
  setSelectedMethod: (method: MethodType | null) => void
  setIncludeHousework: (include: boolean) => void
  reset: () => void
}

type ExpenseState = ExpenseStateProps & ExpenseStateActions

const initialState = {
  data: null,
  minimumWage: null,
  selectedMethod: null,
  includeHousework: true,
  _hasHydrated: false,
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set) => ({
      ...initialState,
      setData: (d) => set({ data: d }),
      setMinimumWage: (wage) => set({ minimumWage: wage }),
      setSelectedMethod: (method) => set({ selectedMethod: method }),
      setIncludeHousework: (include) => set({ includeHousework: include }),
      reset: () => {
        useExpenseStore.persist.clearStorage()
        set({ data: null, selectedMethod: null, includeHousework: true })
      },
    }),
    {
      name: 'expense-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        data: state.data,
        minimumWage: state.minimumWage,
      }),
      onRehydrateStorage: () => {
        return () => {
          useExpenseStore.setState({ _hasHydrated: true })
        }
      },
    },
  ),
)

export const useData = () => useExpenseStore((s) => s.data)
export const useMinimumWage = () => useExpenseStore((s) => s.minimumWage)
export const useSelectedMethod = () => useExpenseStore((s) => s.selectedMethod)

export const useIncludeHousework = () => useExpenseStore((s) => s.includeHousework)

export const useSetData = () => useExpenseStore((s) => s.setData)
export const useSetMinimumWage = () => useExpenseStore((s) => s.setMinimumWage)
export const useSetSelectedMethod = () => useExpenseStore((s) => s.setSelectedMethod)
export const useSetIncludeHousework = () => useExpenseStore((s) => s.setIncludeHousework)
export const useReset = () => useExpenseStore((s) => s.reset)
