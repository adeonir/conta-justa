import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { ExpenseFormData } from '~/schemas/expense-form'

interface ExpenseStateProps {
  formData: ExpenseFormData | null
  minimumWage: number | null // cents
  _hasHydrated: boolean
}

interface ExpenseStateActions {
  setFormData: (data: ExpenseFormData) => void
  setMinimumWage: (wage: number) => void
  reset: () => void
}

type ExpenseState = ExpenseStateProps & ExpenseStateActions

const initialState = {
  formData: null,
  minimumWage: null,
  _hasHydrated: false,
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set) => ({
      ...initialState,
      setFormData: (data) => set({ formData: data }),
      setMinimumWage: (wage) => set({ minimumWage: wage }),
      reset: () => {
        useExpenseStore.persist.clearStorage()
        set({ formData: null })
      },
    }),
    {
      name: 'expense-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        formData: state.formData,
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
