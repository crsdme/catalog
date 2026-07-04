import { z } from 'zod'

export const sorterParamsSchema = z.enum(['asc', 'desc'])
