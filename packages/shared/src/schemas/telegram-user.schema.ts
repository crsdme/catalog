import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'

export const telegramAllowedUserSchema = z.object({
  id: idSchema,
  telegramId: z.string(),
  label: z.string(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type TelegramAllowedUserDTO = z.output<typeof telegramAllowedUserSchema>

export const getTelegramAllowedUserSchema = z.object({
  filters: z.object({
    telegramId: z.string().optional(),
    label: z.string().optional(),
    createdAt: dateRangeSchema.optional(),
    active: booleanArraySchema.optional(),
  }).default({}),
  sorters: z.object({
    telegramId: sorterParamsSchema.optional(),
    label: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional(),
  pagination: paginationSchema.optional().default({}),
})

export type GetTelegramAllowedUserRequest = z.input<typeof getTelegramAllowedUserSchema>

export const createTelegramAllowedUserSchema = z.object({
  telegramId: z.string().min(1).regex(/^\d+$/, 'Telegram ID must contain digits only'),
  label: z.string().optional(),
  active: z.boolean().optional(),
})

export type CreateTelegramAllowedUserRequest = z.input<typeof createTelegramAllowedUserSchema>

export const editTelegramAllowedUserSchema = z.object({
  id: idSchema,
  telegramId: z.string().min(1).regex(/^\d+$/, 'Telegram ID must contain digits only'),
  label: z.string().optional(),
  active: z.boolean().optional(),
})

export type EditTelegramAllowedUserRequest = z.input<typeof editTelegramAllowedUserSchema>

export const removeTelegramAllowedUserSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveTelegramAllowedUserRequest = z.input<typeof removeTelegramAllowedUserSchema>

export const getTelegramAllowedUsersResponseSchema = responseListSchema(telegramAllowedUserSchema)
export type GetTelegramAllowedUsersResponse = z.output<typeof getTelegramAllowedUsersResponseSchema>

export const createTelegramAllowedUserResponseSchema = responseItemSchema(telegramAllowedUserSchema)
export type CreateTelegramAllowedUserResponse = z.output<typeof createTelegramAllowedUserResponseSchema>

export const editTelegramAllowedUserResponseSchema = responseItemSchema(telegramAllowedUserSchema)
export type EditTelegramAllowedUserResponse = z.output<typeof editTelegramAllowedUserResponseSchema>

export const removeTelegramAllowedUserResponseSchema = responseSchema
export type RemoveTelegramAllowedUserResponse = z.output<typeof removeTelegramAllowedUserResponseSchema>
