import { useNavigate } from '@tanstack/react-router'

import type { ExpenseFormData } from '~/schemas/expense-form'
import { useSetData } from '~/stores/expense-store'

export function useExpenseFormSubmit() {
  const navigate = useNavigate()

  const setData = useSetData()

  return (value: ExpenseFormData) => {
    setData(value)
    navigate({ to: '/results' })
  }
}
