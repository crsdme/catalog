import type { RequestHandler } from 'express'
import {
  createTelegramAllowedUserSchema,
  editTelegramAllowedUserSchema,
  getTelegramAllowedUserSchema,
  removeTelegramAllowedUserSchema,
} from '@catalog/shared'
import { Router } from 'express'
import * as TelegramUserController from '@/controllers/telegram-user.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getTelegramAllowedUserSchema),
  TelegramUserController.get as unknown as RequestHandler,
)

router.post(
  '/create',
  checkPermissions('settings.create'),
  validateBodyRequest(createTelegramAllowedUserSchema),
  TelegramUserController.create as unknown as RequestHandler,
)

router.post(
  '/edit',
  checkPermissions('settings.edit'),
  validateBodyRequest(editTelegramAllowedUserSchema),
  TelegramUserController.edit as unknown as RequestHandler,
)

router.post(
  '/remove',
  checkPermissions('settings.remove'),
  validateBodyRequest(removeTelegramAllowedUserSchema),
  TelegramUserController.remove as unknown as RequestHandler,
)

export default router
