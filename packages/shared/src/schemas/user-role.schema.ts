import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'

export const userRoleSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  permissions: z.array(z.string()),
  priority: z.number(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserRoleDTO = z.output<typeof userRoleSchema>

export const getUserRoleSchema = z.object({
  filters: z.object({
    names: z.string().optional(),
    permissions: z.string().optional(),
    priority: z.number().optional(),
    active: booleanArraySchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    permissions: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetUserRoleRequest = z.input<typeof getUserRoleSchema>

export const createUserRoleSchema = z.object({
  names: languageStringSchema,
  permissions: z.array(z.string()).min(1),
  priority: z.number(),
  active: z.boolean().optional(),
})

export type CreateUserRoleRequest = z.input<typeof createUserRoleSchema>

export const editUserRoleSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  permissions: z.array(z.string()).min(1),
  priority: z.number(),
  active: z.boolean().optional(),
})

export type EditUserRoleRequest = z.input<typeof editUserRoleSchema>

export const removeUserRoleSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveUserRoleRequest = z.input<typeof removeUserRoleSchema>

export const getUserRolesResponseSchema = responseListSchema(userRoleSchema)
export type GetUserRolesResponse = z.output<typeof getUserRolesResponseSchema>

export const createUserRoleResponseSchema = responseItemSchema(userRoleSchema)
export type CreateUserRoleResponse = z.output<typeof createUserRoleResponseSchema>

export const editUserRoleResponseSchema = responseItemSchema(userRoleSchema)
export type EditUserRoleResponse = z.output<typeof editUserRoleResponseSchema>

export const removeUserRolesResponseSchema = responseSchema
export type RemoveUserRolesResponse = z.output<typeof removeUserRolesResponseSchema>
