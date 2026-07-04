import { z } from 'zod'

export const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
}).refine(
  r => !r.from || !r.to || r.from < r.to,
  { message: 'from must be before to' },
)
