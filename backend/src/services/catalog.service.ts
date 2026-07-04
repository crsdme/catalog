import type {
  CreateCatalogLinkRequest,
  CreateCatalogLinkResponse,
  GetCatalogLinkRequest,
  GetCatalogLinksResponse,
  GetSelectionRequest,
  GetSelectionsResponse,
  PublicCatalogResponse,
  PublicLinkResponse,
  UpdateCatalogLinkRequest,
  UpdateCatalogLinkResponse,
  UpsertSelectionRequest,
  UpsertSelectionResponse,
} from '@catalog/shared'
import { env } from '@/config/env'
import * as CatalogsRepo from '@/repositories/catalogs.repo'
import * as CatalogSyncService from '@/services/catalog-sync.service'
import * as DriveService from '@/services/drive.service'
import { HttpError } from '@/utils/httpError'
import { mapCatalogLinkToDTO, mapCatalogToDTO } from '@/utils/mappers'

const SYNC_INTERVAL_MS = env.catalogSyncIntervalMinutes * 60 * 1000

function shouldSync(lastSyncedAt: Date | null, categoryCount: number) {
  if (categoryCount === 0)
    return true
  if (!lastSyncedAt)
    return true
  return Date.now() - lastSyncedAt.getTime() > SYNC_INTERVAL_MS
}

async function syncCatalogTree(catalog: { id: string, driveFolderId: string, lastSyncedAt: Date | null }, force = false) {
  if (!DriveService.isDriveConfigured()) {
    console.warn('[catalog] Google Drive is not configured — sync skipped')
    return null
  }
  if (!catalog.driveFolderId) {
    console.warn(`[catalog] Catalog ${catalog.id} has empty driveFolderId — sync skipped`)
    return null
  }

  if (!force) {
    const categories = await CatalogsRepo.listCategories(catalog.id)
    if (!shouldSync(catalog.lastSyncedAt, categories.length))
      return null
  }

  return CatalogSyncService.syncCatalogTree(catalog.id, catalog.driveFolderId)
}

async function buildPublicCatalogData(
  catalog: NonNullable<Awaited<ReturnType<typeof CatalogsRepo.findBySlug>>>,
  clientName: string,
  options?: {
    linkToken?: string | null
    categoryIds?: string[]
    label?: string
  },
) {
  await syncCatalogTree(catalog)

  const categories = await CatalogsRepo.listCategories(catalog.id)
  const isScopedLink = Boolean(options?.linkToken)

  const allowedCategoryIds = isScopedLink
    ? CatalogSyncService.expandCategoryScope(categories, options?.categoryIds ?? [])
    : options?.categoryIds?.length
      ? CatalogSyncService.expandCategoryScope(categories, options.categoryIds)
      : undefined

  const [photos, selections] = await Promise.all([
    CatalogsRepo.listPhotos(catalog.id, allowedCategoryIds),
    CatalogsRepo.listSelections(catalog.id, clientName),
  ])

  const visiblePhotoIds = new Set(photos.map(photo => photo.id))
  const filteredSelections = selections.filter(selection => visiblePhotoIds.has(selection.photoId))
  const visibleCategories = allowedCategoryIds
    ? categories.filter(category => allowedCategoryIds.has(category.id))
    : categories

  return {
    catalog: mapCatalogToDTO(catalog),
    categories: visibleCategories,
    photos,
    selections: filteredSelections,
    clientName,
    linkToken: options?.linkToken ?? undefined,
    label: options?.label ?? '',
  }
}

export async function getDefaultCatalog() {
  let catalog = await CatalogsRepo.findBySlug(env.defaultCatalogSlug)
  if (!catalog && env.googleDriveFolderId) {
    catalog = await CatalogsRepo.seedCatalog({
      slug: env.defaultCatalogSlug,
      title: 'Catalog',
      driveFolderId: env.googleDriveFolderId,
    })
  }
  if (!catalog)
    throw new HttpError(404, 'Catalog not found', 'CATALOG_NOT_FOUND')
  return catalog
}

export async function getPublicCatalog(slug: string, clientName: string): Promise<PublicCatalogResponse> {
  const catalog = await CatalogsRepo.findBySlug(slug)
  if (!catalog)
    throw new HttpError(404, 'Catalog not found', 'CATALOG_NOT_FOUND')

  const data = await buildPublicCatalogData(catalog, clientName)

  return {
    status: 'success',
    code: 'CATALOG_FETCHED',
    message: 'Catalog fetched',
    data,
  }
}

export async function getPublicLink(token: string): Promise<PublicLinkResponse> {
  const linkRow = await CatalogsRepo.findLinkByToken(token)
  if (!linkRow)
    throw new HttpError(404, 'Link not found', 'CATALOG_LINK_NOT_FOUND')

  const data = await buildPublicCatalogData(
    linkRow.catalog,
    linkRow.link.clientName,
    {
      linkToken: linkRow.link.token,
      categoryIds: linkRow.link.categoryIds,
      label: linkRow.link.label,
    },
  )

  return {
    status: 'success',
    code: 'CATALOG_LINK_FETCHED',
    message: 'Catalog link fetched',
    data: {
      ...data,
      token: linkRow.link.token,
    },
  }
}

export async function upsertSelection(payload: UpsertSelectionRequest): Promise<UpsertSelectionResponse> {
  let catalogId: string
  let clientName: string
  let linkToken: string | null = null

  if (payload.token) {
    const linkRow = await CatalogsRepo.findLinkByToken(payload.token)
    if (!linkRow)
      throw new HttpError(404, 'Link not found', 'CATALOG_LINK_NOT_FOUND')
    catalogId = linkRow.catalog.id
    clientName = linkRow.link.clientName
    linkToken = linkRow.link.token
  }
  else if (payload.slug && payload.clientName) {
    const catalog = await CatalogsRepo.findBySlug(payload.slug)
    if (!catalog)
      throw new HttpError(404, 'Catalog not found', 'CATALOG_NOT_FOUND')
    catalogId = catalog.id
    clientName = payload.clientName
  }
  else {
    throw new HttpError(400, 'Invalid selection payload', 'INVALID_SELECTION_PAYLOAD')
  }

  const selection = await CatalogsRepo.upsertSelection({
    catalogId,
    photoId: payload.photoId,
    clientName,
    linkToken,
    markers: payload.markers,
  })

  return {
    status: 'success',
    code: 'SELECTION_SAVED',
    message: 'Selection saved',
    data: selection,
  }
}

export async function createCatalogLink(payload: CreateCatalogLinkRequest): Promise<CreateCatalogLinkResponse> {
  if (!env.frontendUrl)
    throw new HttpError(500, 'Frontend URL is not configured', 'FRONTEND_URL_NOT_CONFIGURED')

  const link = await CatalogsRepo.createLink(
    {
      catalogId: payload.catalogId,
      clientName: payload.clientName,
      label: payload.label,
      categoryIds: payload.categoryIds,
      managerTelegramId: payload.managerTelegramId,
      expiresAt: payload.expiresAt,
    },
    env.frontendUrl,
  )

  return {
    status: 'success',
    code: 'CATALOG_LINK_CREATED',
    message: 'Catalog link created',
    data: link,
  }
}

export async function updateCatalogLink(payload: UpdateCatalogLinkRequest): Promise<UpdateCatalogLinkResponse> {
  const row = await CatalogsRepo.updateLink(payload)
  if (!env.frontendUrl)
    throw new HttpError(500, 'Frontend URL is not configured', 'FRONTEND_URL_NOT_CONFIGURED')

  return {
    status: 'success',
    code: 'CATALOG_LINK_UPDATED',
    message: 'Catalog link updated',
    data: mapCatalogLinkToDTO(row, `${env.frontendUrl}/c/${row.token}`),
  }
}

export async function getCatalogLinks(payload: GetCatalogLinkRequest): Promise<GetCatalogLinksResponse> {
  const result = await CatalogsRepo.listLinks(payload, env.frontendUrl ?? '')

  return {
    status: 'success',
    code: 'CATALOG_LINKS_FETCHED',
    message: 'Catalog links fetched',
    data: {
      items: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      },
    },
  }
}

export async function getSelections(payload: GetSelectionRequest): Promise<GetSelectionsResponse> {
  const result = await CatalogsRepo.listManagerSelections(payload)

  return {
    status: 'success',
    code: 'SELECTIONS_FETCHED',
    message: 'Selections fetched',
    data: {
      items: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      },
    },
  }
}

export async function getLinkSelections(token: string) {
  const linkRow = await CatalogsRepo.findLinkByToken(token)
  if (!linkRow)
    throw new HttpError(404, 'Link not found', 'CATALOG_LINK_NOT_FOUND')

  const selections = await CatalogsRepo.listSelectionsByLinkToken(token)
  return {
    link: linkRow.link,
    selections,
  }
}

export async function listCategoriesForCatalog(catalogId: string, forceSync = false) {
  const catalog = await CatalogsRepo.findById(catalogId)
  if (!catalog)
    throw new HttpError(404, 'Catalog not found', 'CATALOG_NOT_FOUND')

  const syncResult = await syncCatalogTree(catalog, forceSync)
  const categories = await CatalogsRepo.listCategories(catalogId)
  return { categories, syncResult }
}

export async function getCategoriesFromDb(catalogId: string) {
  return CatalogsRepo.listCategories(catalogId)
}

export async function forceSyncCatalog(catalogId: string) {
  const catalog = await CatalogsRepo.findById(catalogId)
  if (!catalog)
    throw new HttpError(404, 'Catalog not found', 'CATALOG_NOT_FOUND')

  const syncResult = await syncCatalogTree(catalog, true)
  const categories = await CatalogsRepo.listCategories(catalogId)
  return { categories, syncResult }
}

export async function listManagerLinks(telegramId: string) {
  return CatalogsRepo.listLinksByManager(telegramId)
}

export async function deleteCatalogLink(id: string, managerTelegramId: string) {
  const link = await CatalogsRepo.findLinkById(id)
  if (!link)
    throw new HttpError(404, 'Link not found', 'CATALOG_LINK_NOT_FOUND')

  if (link.managerTelegramId && link.managerTelegramId !== managerTelegramId)
    throw new HttpError(403, 'Forbidden', 'FORBIDDEN')

  await CatalogsRepo.softDeleteLink(id)

  return {
    status: 'success' as const,
    code: 'CATALOG_LINK_DELETED',
    message: 'Catalog link deleted',
  }
}
