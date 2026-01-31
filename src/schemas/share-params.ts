import { z } from 'zod'

import type { ExpenseFormData } from '~/schemas/expense-form'

export const shareParamsSchema = z
  .object({
    a: z.string().trim().min(1),
    ra: z.coerce.number().int().positive(),
    b: z.string().trim().min(1),
    rb: z.coerce.number().int().positive(),
    e: z.coerce.number().int().positive(),
    ha: z.coerce.number().int().min(0).default(0),
    hb: z.coerce.number().int().min(0).default(0),
  })
  .transform(
    (params): ExpenseFormData => ({
      nameA: params.a,
      incomeA: params.ra,
      nameB: params.b,
      incomeB: params.rb,
      expenses: params.e,
      houseworkA: params.ha,
      houseworkB: params.hb,
    }),
  )

export type ShareParams = z.input<typeof shareParamsSchema>
