import { useNavigate } from '@tanstack/react-router'

import type { ExpenseFormData } from '~/schemas/expense-form'
import { useExpenseStore } from '~/stores/expense-store'

export function useExpenseFormSubmit() {
  const navigate = useNavigate()
  const setFormData = useExpenseStore((state) => state.setFormData)

  return (value: ExpenseFormData) => {
    setFormData(value)
    navigate({ to: '/results' })
  }
}
