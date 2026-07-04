import type { RequestHandler } from 'express'
import {
  createCatalogLinkSchema,
  getCatalogLinkSchema,
  getSelectionSchema,
  upsertSelectionSchema,
} from '@catalog/shared'
import { Router } from 'express'
import * as CatalogController from '@/controllers/catalog.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get('/catalog/:slug', CatalogController.getCatalog as unknown as RequestHandler)
router.get('/link/:token', CatalogController.getLink as unknown as RequestHandler)
router.put(
  '/selections',
  validateBodyRequest(upsertSelectionSchema),
  CatalogController.upsertSelection as unknown as RequestHandler,
)
router.get('/photos/:fileId/image', CatalogController.getPhotoImage as unknown as RequestHandler)

export default router
