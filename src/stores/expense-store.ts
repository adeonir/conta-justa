import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { MethodType } from '~/components/app/results/types'
import type { ExpenseFormData } from '~/schemas/expense-form'

interface ExpenseStateProps {
  data: ExpenseFormData | null
  minimumWage: number | null
  selectedMethod: MethodType | null
  _hasHydrated: boolean
}

interface ExpenseStateActions {
  setData: (data: ExpenseFormData) => void
  setMinimumWage: (wage: number) => void
  setSelectedMethod: (method: MethodType | null) => void
  reset: () => void
}

type ExpenseState = ExpenseStateProps & ExpenseStateActions

const initialState = {
  data: null,
  minimumWage: null,
  selectedMethod: null,
  _hasHydrated: false,
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set) => ({
      ...initialState,
      setData: (d) => set({ data: d }),
      setMinimumWage: (wage) => set({ minimumWage: wage }),
      setSelectedMethod: (method) => set({ selectedMethod: method }),
      reset: () => {
        useExpenseStore.persist.clearStorage()
        set({ data: null, selectedMethod: null })
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

export const useSetMinimumWage = () => useExpenseStore((s) => s.setMinimumWage)
export const useSetSelectedMethod = () => useExpenseStore((s) => s.setSelectedMethod)
export const useReset = () => useExpenseStore((s) => s.reset)
