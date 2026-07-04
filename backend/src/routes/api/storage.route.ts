import type { RequestHandler } from 'express'
import { Router } from 'express'
import * as StorageController from '@/controllers/storage.controller'
import { checkPermissions, uploadMiddleware } from '@/middleware'

const router = Router()

router.post(
  '/upload',
  checkPermissions('storage.upload'),
  uploadMiddleware({ fieldName: 'file', storageKey: 'uploads' }),
  StorageController.upload as unknown as RequestHandler,
)

export default router
