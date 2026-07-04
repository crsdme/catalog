import type { RequestHandler } from 'express'
import {
  createSettingSchema,
  editSettingSchema,
  getSettingsSchema,
  removeSettingSchema,
} from '@catalog/shared'
import { Router } from 'express'
import * as SettingController from '@/controllers/setting.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getSettingsSchema),
  SettingController.get as unknown as unknown as RequestHandler,
)

router.post(
  '/create',
  checkPermissions('settings.create'),
  validateBodyRequest(createSettingSchema),
  SettingController.create as unknown as RequestHandler,
)

router.post(
  '/edit',
  checkPermissions('settings.edit'),
  validateBodyRequest(editSettingSchema),
  SettingController.edit as unknown as RequestHandler,
)

router.post(
  '/remove',
  checkPermissions('settings.remove'),
  validateBodyRequest(removeSettingSchema),
  SettingController.remove as unknown as RequestHandler,
)

export default router
