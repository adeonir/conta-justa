import { z } from 'zod'

const envSchema = z.object({
  MINIMUM_WAGE: z.coerce.number().positive('MINIMUM_WAGE must be a positive number'),
})

export const env = envSchema.parse(process.env)
