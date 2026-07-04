import type { RequestHandler } from 'express'
import { loginSchema } from '@catalog/shared'
import { Router } from 'express'
import * as AuthController from '@/controllers/auth.controller'
import { refreshJWT, validateBodyRequest } from '@/middleware'

const router = Router()

router.post(
  '/login',
  validateBodyRequest(loginSchema),
  AuthController.login as unknown as RequestHandler,
)

router.post(
  '/refresh',
  refreshJWT,
  AuthController.refresh as RequestHandler,
)

router.post(
  '/logout',
  AuthController.logout as RequestHandler,
)

export default router
