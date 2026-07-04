import type { RequestHandler } from 'express'
import { createCatalogLinkSchema, getCatalogLinkSchema, updateCatalogLinkSchema } from '@catalog/shared'
import { Router } from 'express'
import * as CatalogController from '@/controllers/catalog.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  checkPermissions('catalog.link.read'),
  validateQueryRequest(getCatalogLinkSchema),
  CatalogController.getLinks as unknown as RequestHandler,
)

router.post(
  '/create',
  checkPermissions('catalog.link.create'),
  validateBodyRequest(createCatalogLinkSchema),
  CatalogController.createLink as unknown as RequestHandler,
)

router.post(
  '/edit',
  checkPermissions('catalog.link.create'),
  validateBodyRequest(updateCatalogLinkSchema),
  CatalogController.updateLink as unknown as RequestHandler,
)

export default router
