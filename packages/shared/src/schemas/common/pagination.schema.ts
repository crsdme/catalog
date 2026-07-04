import { z } from 'zod'
import { numberFromStringSchema } from './number-from-string.schema'

export const paginationSchema = z.object({
  current: numberFromStringSchema.default(1),
  pageSize: numberFromStringSchema.default(10),
  full: z.coerce.boolean().default(false),
})

export const paginationResponseSchema = z.object({
  total: numberFromStringSchema,
  page: numberFromStringSchema,
  pageSize: numberFromStringSchema,
})
