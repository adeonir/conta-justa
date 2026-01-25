import { z } from 'zod'

export const expenseFormSchema = z.object({
  nameA: z.string().min(1, 'Campo obrigatório'),
  incomeA: z.number().positive('Valor deve ser maior que zero'),
  nameB: z.string().min(1, 'Campo obrigatório'),
  incomeB: z.number().positive('Valor deve ser maior que zero'),
  expenses: z.number().positive('Valor deve ser maior que zero'),
})

export type ExpenseFormData = z.infer<typeof expenseFormSchema>
