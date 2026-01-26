import { useNavigate } from '@tanstack/react-router'

import type { ExpenseFormData } from '~/schemas/expense-form'

export function useExpenseFormSubmit() {
  const navigate = useNavigate()

  return (value: ExpenseFormData) => {
    const params = new URLSearchParams({
      a: value.nameA,
      ra: String(value.incomeA),
      b: value.nameB,
      rb: String(value.incomeB),
      d: String(value.expenses),
    })

    if (value.houseworkA > 0) {
      params.set('ha', String(value.houseworkA))
    }
    if (value.houseworkB > 0) {
      params.set('hb', String(value.houseworkB))
    }

    navigate({ to: `/resultado?${params.toString()}` })
  }
}
