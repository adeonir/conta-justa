import { z } from 'zod'

const MAX_INCOME_CENTS = 50_000_000 // R$ 500,000 in cents
const MAX_HOUSEWORK_HOURS = 168 // 24 hours * 7 days
const MAX_NAME_LENGTH = 50

export const expenseFormSchema = z.object({
  nameA: z.string().min(1, 'Campo obrigatório').max(MAX_NAME_LENGTH, 'Máximo 50 caracteres'),
  incomeA: z.number().positive('Valor deve ser maior que zero').max(MAX_INCOME_CENTS, 'Valor máximo excedido'),
  nameB: z.string().min(1, 'Campo obrigatório').max(MAX_NAME_LENGTH, 'Máximo 50 caracteres'),
  incomeB: z.number().positive('Valor deve ser maior que zero').max(MAX_INCOME_CENTS, 'Valor máximo excedido'),
  expenses: z.number().positive('Valor deve ser maior que zero').max(MAX_INCOME_CENTS, 'Valor máximo excedido'),
  houseworkA: z.number().min(0, 'Valor deve ser zero ou maior').max(MAX_HOUSEWORK_HOURS, 'Máximo 168 horas por semana'),
  houseworkB: z.number().min(0, 'Valor deve ser zero ou maior').max(MAX_HOUSEWORK_HOURS, 'Máximo 168 horas por semana'),
})

export type ExpenseFormData = z.infer<typeof expenseFormSchema>
