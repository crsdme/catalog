import { z } from 'zod'

export const loginSchema = z.object({
  login: z.string(),
  password: z.string(),
})

export type LoginRequest = z.infer<typeof loginSchema>

export const refreshSchema = z.object({ refreshToken: z.string() })

export const tokenSchema = z.object({
  id: z.string().uuid(),
  login: z.string(),
  permissions: z.array(z.string()),
})

export const authUserSchema = z.object({
  id: z.string(),
  login: z.string(),
  permissions: z.array(z.string()),
})

export type AuthUser = z.infer<typeof authUserSchema>

export const authUserDTOSchema = z.object({
  id: z.string(),
  login: z.string(),
  name: z.string(),
  permissions: z.array(z.string()),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type AuthUserDTO = z.infer<typeof authUserDTOSchema>
