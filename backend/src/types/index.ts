import type { AuthUser } from '@catalog/shared'
import type { z } from 'zod'

export interface TokenPayload {
  id: string
  login: string
  permissions: string[]
}

export interface LoginPayload {
  login: string
  password: string
}

export interface RefreshPayload {
  refreshToken: string
}

export interface ValidatedRequest<
  TQuery = unknown,
  TBody = unknown,
  TParams = unknown,
> extends Express.Request {
  validated?: {
    query: TQuery
    body: TBody
    params: TParams
  }
  user?: AuthUser
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export type InferValidatedBody<TSchema extends z.ZodTypeAny> = z.output<TSchema>
