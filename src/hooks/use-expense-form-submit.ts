import type { ExpenseFormData } from '~/schemas/expense-form'

export function useExpenseFormSubmit() {
  return (value: ExpenseFormData) => {
    const params = new URLSearchParams({
      a: value.nameA,
      ra: String(value.incomeA),
      b: value.nameB,
      rb: String(value.incomeB),
      d: String(value.expenses),
    })

    console.log('Form submitted:', params.toString())
  }
}
