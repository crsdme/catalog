import { z } from 'zod'

export const languageCodeSchema = z.enum(['ru', 'en'])

export type LanguageCode = z.infer<typeof languageCodeSchema>
