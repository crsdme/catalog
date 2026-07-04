import type { RequestHandler } from 'express'
import {
  createUserSchema,
  editUserSchema,
  getUserSchema,
  removeUserSchema,
} from '@catalog/shared'
import { Router } from 'express'
import * as UserController from '@/controllers/user.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getUserSchema),
  UserController.get as unknown as RequestHandler,
)

router.post(
  '/create',
  checkPermissions('user.create'),
  validateBodyRequest(createUserSchema),
  UserController.create as unknown as RequestHandler,
)

router.post(
  '/edit',
  checkPermissions('user.edit'),
  validateBodyRequest(editUserSchema),
  UserController.edit as unknown as RequestHandler,
)

router.post(
  '/remove',
  checkPermissions('user.remove'),
  validateBodyRequest(removeUserSchema),
  UserController.remove as unknown as RequestHandler,
)

export default router
