import type { RequestHandler } from 'express'
import {
  createUserRoleSchema,
  editUserRoleSchema,
  getUserRoleSchema,
  removeUserRoleSchema,
} from '@catalog/shared'
import { Router } from 'express'
import * as UserRoleController from '@/controllers/user-role.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getUserRoleSchema),
  UserRoleController.get as unknown as RequestHandler,
)

router.post(
  '/create',
  checkPermissions('userRole.create'),
  validateBodyRequest(createUserRoleSchema),
  UserRoleController.create as unknown as RequestHandler,
)

router.post(
  '/edit',
  checkPermissions('userRole.edit'),
  validateBodyRequest(editUserRoleSchema),
  UserRoleController.edit as unknown as RequestHandler,
)

router.post(
  '/remove',
  checkPermissions('userRole.remove'),
  validateBodyRequest(removeUserRoleSchema),
  UserRoleController.remove as unknown as RequestHandler,
)

export default router
