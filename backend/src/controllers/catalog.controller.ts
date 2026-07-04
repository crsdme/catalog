import type { NextFunction, Request, Response } from 'express'
import type {
  CreateCatalogLinkRequest,
  GetCatalogLinkRequest,
  GetSelectionRequest,
  UpdateCatalogLinkRequest,
  UpsertSelectionRequest,
} from '@catalog/shared'
import type { ValidatedRequest } from '@/types'
import * as CatalogService from '@/services/catalog.service'
import * as ImageProxyService from '@/services/image-proxy.service'
import { HttpError } from '@/utils/httpError'

function param(value: string | string[] | undefined) {
  if (Array.isArray(value))
    return value[0] ?? ''
  return value ?? ''
}

export async function getCatalog(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = param(req.params.slug)
    const client = typeof req.query.client === 'string' ? req.query.client.trim() : ''
    if (!slug || !client)
      throw new HttpError(400, 'Slug and client are required', 'INVALID_CATALOG_REQUEST')

    const serviceResponse = await CatalogService.getPublicCatalog(slug, client)
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function getLink(req: Request, res: Response, next: NextFunction) {
  try {
    const token = param(req.params.token)
    if (!token)
      throw new HttpError(400, 'Token is required', 'INVALID_LINK_REQUEST')

    const serviceResponse = await CatalogService.getPublicLink(token)
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function upsertSelection(
  req: ValidatedRequest<unknown, UpsertSelectionRequest>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CatalogService.upsertSelection(req.validated!.body)
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function updateLink(
  req: ValidatedRequest<unknown, UpdateCatalogLinkRequest>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CatalogService.updateCatalogLink(req.validated!.body)
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function getPhotoImage(req: Request, res: Response, next: NextFunction) {
  try {
    const fileId = param(req.params.fileId)
    if (!fileId)
      throw new HttpError(400, 'File id is required', 'INVALID_PHOTO_REQUEST')

    const options = ImageProxyService.parseImageProxyQuery(req.query as Record<string, unknown>)
    const buffer = await ImageProxyService.getOptimizedDriveImage(fileId, options)

    res.setHeader('Content-Type', 'image/webp')
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable')
    res.send(buffer)
  }
  catch (err) {
    next(err)
  }
}

export async function createLink(
  req: ValidatedRequest<unknown, CreateCatalogLinkRequest>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CatalogService.createCatalogLink(req.validated!.body)
    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function getLinks(
  req: ValidatedRequest<GetCatalogLinkRequest>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CatalogService.getCatalogLinks(req.validated?.query ?? {} as GetCatalogLinkRequest)
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function getSelections(
  req: ValidatedRequest<GetSelectionRequest>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CatalogService.getSelections(req.validated?.query ?? {} as GetSelectionRequest)
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
