import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'
import { userRoleSchema } from './user-role.schema'

export const userSchema = z.object({
  id: idSchema,
  seq: z.number(),
  name: z.string(),
  login: z.string(),
  roleId: idSchema,
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserDTO = z.output<typeof userSchema>

export const userPopulatedSchema = z.object({
  id: idSchema,
  seq: z.number(),
  name: z.string(),
  login: z.string(),
  role: userRoleSchema,
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserPopulatedDTO = z.output<typeof userPopulatedSchema>

export const getUserSchema = z.object({
  filters: z.object({
    name: z.string().optional(),
    login: z.string().optional(),
    role: z.string().optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
    active: booleanArraySchema.optional(),
  }).default({}),
  sorters: z.object({
    name: sorterParamsSchema.optional(),
    login: sorterParamsSchema.optional(),
    role: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional(),
  pagination: paginationSchema.optional().default({}),
})

export type GetUserRequest = z.input<typeof getUserSchema>

export const createUserSchema = z.object({
  name: z.string(),
  login: z.string(),
  password: z.string(),
  role: idSchema,
  active: z.boolean().optional(),
})

export type CreateUserRequest = z.input<typeof createUserSchema>

export const editUserSchema = z.object({
  id: idSchema,
  name: z.string(),
  login: z.string(),
  password: z.string().optional(),
  role: idSchema,
  active: z.boolean().optional(),
})

export type EditUserRequest = z.input<typeof editUserSchema>

export const removeUserSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveUserRequest = z.input<typeof removeUserSchema>

export const getUsersResponseSchema = responseListSchema(userPopulatedSchema)
export type GetUsersResponse = z.output<typeof getUsersResponseSchema>

export const createUserResponseSchema = responseItemSchema(userSchema)
export type CreateUserResponse = z.output<typeof createUserResponseSchema>

export const editUserResponseSchema = responseItemSchema(userSchema)
export type EditUserResponse = z.output<typeof editUserResponseSchema>

export const removeUserResponseSchema = responseSchema
export type RemoveUserResponse = z.output<typeof removeUserResponseSchema>
