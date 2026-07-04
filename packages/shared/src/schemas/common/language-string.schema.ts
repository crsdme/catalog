import { z } from 'zod'

export const languageStringSchema = z.object({
  ru: z.string().trim().optional(),
  en: z.string().trim().optional(),
})
