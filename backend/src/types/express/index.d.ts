import type { AuthUser } from '@catalog/shared'

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export {}
