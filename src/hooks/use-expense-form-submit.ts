import { useNavigate } from '@tanstack/react-router'

import type { ExpenseFormData } from '~/schemas/expense-form'
import { useExpenseStore } from '~/stores/expense-store'

export function useExpenseFormSubmit() {
  const navigate = useNavigate()
  const setData = useExpenseStore((state) => state.setData)

  return (value: ExpenseFormData) => {
    setData(value)
    navigate({ to: '/results' })
  }
}
