import { z } from 'zod'

export const expenseFormSchema = z.object({
  nameA: z.string().min(1, 'Campo obrigatório'),
  incomeA: z.number().positive('Valor deve ser maior que zero'),
  nameB: z.string().min(1, 'Campo obrigatório'),
  incomeB: z.number().positive('Valor deve ser maior que zero'),
  expenses: z.number().positive('Valor deve ser maior que zero'),
  houseworkA: z.number().min(0, 'Valor deve ser zero ou maior').optional(),
  houseworkB: z.number().min(0, 'Valor deve ser zero ou maior').optional(),
})

export type ExpenseFormData = z.infer<typeof expenseFormSchema>
