import type { ExpenseFormData } from '~/schemas/expense-form'

export function buildShareUrl(data: ExpenseFormData, baseUrl: string): string {
  const params = new URLSearchParams()

  params.set('a', data.nameA)
  params.set('ra', String(data.incomeA))
  params.set('b', data.nameB)
  params.set('rb', String(data.incomeB))
  params.set('e', String(data.expenses))
  if (data.houseworkA > 0) params.set('ha', String(data.houseworkA))
  if (data.houseworkB > 0) params.set('hb', String(data.houseworkB))

  return `${baseUrl}/results?${params.toString()}`
}
