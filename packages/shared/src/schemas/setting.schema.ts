import { z } from 'zod'
import { idSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema } from './common'

export const settingSchema = z.object({
  id: idSchema,
  key: z.string().trim(),
  value: z.string().default(''),
  scope: z.string().trim().optional(),
  description: z.string().trim().optional(),
  isPublic: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type SettingDTO = z.output<typeof settingSchema>

export const getSettingsSchema = z.object({
  filters: z.object({
    key: z.string().trim().optional(),
    scope: z.string().trim().optional(),
    isPublic: z.coerce.boolean().optional(),
    description: z.string().trim().optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetSettingsRequest = z.input<typeof getSettingsSchema>

export const editSettingSchema = z.object({
  id: idSchema,
  key: z.string().trim(),
  value: z.any().optional().default(null),
  isPublic: z.boolean().optional().default(false),
  scope: z.string().trim().optional(),
})

export type EditSettingRequest = z.input<typeof editSettingSchema>

export const createSettingSchema = z.object({
  key: z.string().trim(),
  value: z.any().optional().default(null),
  scope: z.string().trim().optional(),
  description: z.string().trim().optional(),
  isPublic: z.boolean().optional().default(false),
})

export type CreateSettingRequest = z.input<typeof createSettingSchema>

export const removeSettingSchema = z.object({
  id: idSchema,
})

export type RemoveSettingRequest = z.input<typeof removeSettingSchema>

export const getSettingsResponseSchema = responseListSchema(settingSchema)
export type GetSettingsResponse = z.output<typeof getSettingsResponseSchema>

export const createSettingResponseSchema = responseItemSchema(settingSchema)
export type CreateSettingResponse = z.output<typeof createSettingResponseSchema>

export const editSettingResponseSchema = responseItemSchema(settingSchema)
export type EditSettingResponse = z.output<typeof editSettingResponseSchema>

export const removeSettingResponseSchema = responseSchema
export type RemoveSettingResponse = z.output<typeof removeSettingResponseSchema>
