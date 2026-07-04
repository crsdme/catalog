import type { RequestHandler } from 'express'
import { getSelectionSchema } from '@catalog/shared'
import { Router } from 'express'
import * as CatalogController from '@/controllers/catalog.controller'
import { checkPermissions, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  checkPermissions('selection.view'),
  validateQueryRequest(getSelectionSchema),
  CatalogController.getSelections as unknown as RequestHandler,
)

export default router
