import type { GetCatalogLinkRequest, GetSelectionRequest, UpsertSelectionRequest } from '@catalog/shared'
import { and, asc, count, desc, eq, ilike, inArray, sql } from 'drizzle-orm'
import { randomBytes } from 'node:crypto'
import { db } from '@/db'
import { catalogCategories, catalogLinks, catalogPhotos, catalogs, photoSelections } from '@/db/schema'
import { HttpError } from '@/utils/httpError'
import {
  mapCatalogCategoryToDTO,
  mapCatalogLinkToDTO,
  mapCatalogPhotoToDTO,
  mapCatalogToDTO,
  mapManagerSelectionToDTO,
  mapPhotoSelectionToDTO,
} from '@/utils/mappers'
import { resolvePagination } from '@/utils/pagination'

export async function findBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(catalogs)
    .where(and(eq(catalogs.slug, slug), eq(catalogs.active, true), eq(catalogs.removed, false)))
    .limit(1)
  return row ?? null
}

export async function findById(id: string) {
  const [row] = await db
    .select()
    .from(catalogs)
    .where(and(eq(catalogs.id, id), eq(catalogs.removed, false)))
    .limit(1)
  return row ?? null
}

export async function listCategories(catalogId: string) {
  const rows = await db
    .select()
    .from(catalogCategories)
    .where(and(eq(catalogCategories.catalogId, catalogId), eq(catalogCategories.removed, false)))
    .orderBy(asc(catalogCategories.path))

  return rows.map(mapCatalogCategoryToDTO)
}

export async function listPhotos(catalogId: string, allowedCategoryIds?: Set<string>) {
  const rows = await db
    .select({ photo: catalogPhotos, category: catalogCategories })
    .from(catalogPhotos)
    .leftJoin(catalogCategories, eq(catalogPhotos.categoryId, catalogCategories.id))
    .where(and(eq(catalogPhotos.catalogId, catalogId), eq(catalogPhotos.removed, false)))
    .orderBy(asc(catalogCategories.path), asc(catalogPhotos.sortOrder), asc(catalogPhotos.name))

  return rows
    .filter(({ photo }) => {
      if (!allowedCategoryIds)
        return true
      if (!photo.categoryId)
        return allowedCategoryIds.size === 0
      return allowedCategoryIds.has(photo.categoryId)
    })
    .map(({ photo, category }) => mapCatalogPhotoToDTO(photo, category?.path ?? ''))
}

export async function upsertPhotosFromDrive(
  catalogId: string,
  files: Array<{ fileId: string, name: string }>,
) {
  const existing = await db
    .select()
    .from(catalogPhotos)
    .where(eq(catalogPhotos.catalogId, catalogId))

  const existingByFileId = new Map(existing.map(row => [row.driveFileId, row]))
  const incomingIds = new Set(files.map(file => file.fileId))

  await db.transaction(async (tx) => {
    for (const [index, file] of files.entries()) {
      const current = existingByFileId.get(file.fileId)
      if (current) {
        await tx
          .update(catalogPhotos)
          .set({
            name: file.name,
            sortOrder: index,
            removed: false,
            updatedAt: sql`now()`,
          })
          .where(eq(catalogPhotos.id, current.id))
      }
      else {
        await tx.insert(catalogPhotos).values({
          catalogId,
          driveFileId: file.fileId,
          name: file.name,
          sortOrder: index,
        })
      }
    }

    const toRemove = existing.filter(row => !incomingIds.has(row.driveFileId) && !row.removed)
    if (toRemove.length) {
      await tx
        .update(catalogPhotos)
        .set({ removed: true, updatedAt: sql`now()` })
        .where(inArray(catalogPhotos.id, toRemove.map(row => row.id)))
    }

    await tx
      .update(catalogs)
      .set({ lastSyncedAt: sql`now()`, updatedAt: sql`now()` })
      .where(eq(catalogs.id, catalogId))
  })
}

export async function markSynced(catalogId: string) {
  await db
    .update(catalogs)
    .set({ lastSyncedAt: sql`now()`, updatedAt: sql`now()` })
    .where(eq(catalogs.id, catalogId))
}

export async function listSelections(catalogId: string, clientName: string) {
  const rows = await db
    .select()
    .from(photoSelections)
    .where(and(
      eq(photoSelections.catalogId, catalogId),
      eq(photoSelections.clientName, clientName),
      eq(photoSelections.removed, false),
    ))

  return rows.map(mapPhotoSelectionToDTO)
}

export async function upsertSelection(payload: {
  catalogId: string
  photoId: string
  clientName: string
  linkToken?: string | null
  markers: UpsertSelectionRequest['markers']
}) {
  const [photo] = await db
    .select()
    .from(catalogPhotos)
    .where(and(
      eq(catalogPhotos.id, payload.photoId),
      eq(catalogPhotos.catalogId, payload.catalogId),
      eq(catalogPhotos.removed, false),
    ))
    .limit(1)

  if (!photo)
    throw new HttpError(404, 'Photo not found', 'PHOTO_NOT_FOUND')

  const [row] = await db
    .insert(photoSelections)
    .values({
      catalogId: payload.catalogId,
      photoId: payload.photoId,
      clientName: payload.clientName,
      linkToken: payload.linkToken ?? null,
      markers: payload.markers,
    })
    .onConflictDoUpdate({
      target: [photoSelections.catalogId, photoSelections.photoId, photoSelections.clientName],
      set: {
        markers: payload.markers,
        linkToken: payload.linkToken ?? null,
        removed: false,
        updatedAt: sql`now()`,
      },
    })
    .returning()

  return mapPhotoSelectionToDTO(row)
}

export async function findLinkByToken(token: string) {
  const [row] = await db
    .select({ link: catalogLinks, catalog: catalogs })
    .from(catalogLinks)
    .innerJoin(catalogs, eq(catalogLinks.catalogId, catalogs.id))
    .where(and(
      eq(catalogLinks.token, token),
      eq(catalogLinks.removed, false),
      eq(catalogs.removed, false),
      eq(catalogs.active, true),
    ))
    .limit(1)

  if (!row)
    return null

  if (row.link.expiresAt && row.link.expiresAt < new Date())
    throw new HttpError(410, 'Link expired', 'CATALOG_LINK_EXPIRED')

  return row
}

export async function createLink(payload: {
  catalogId: string
  clientName: string
  label?: string
  categoryIds?: string[]
  managerTelegramId?: string
  expiresAt?: Date
}, frontendUrl: string) {
  const catalog = await findById(payload.catalogId)
  if (!catalog)
    throw new HttpError(404, 'Catalog not found', 'CATALOG_NOT_FOUND')

  const token = randomBytes(16).toString('hex')

  const [row] = await db.insert(catalogLinks).values({
    token,
    catalogId: payload.catalogId,
    clientName: payload.clientName,
    label: payload.label ?? '',
    categoryIds: payload.categoryIds ?? [],
    managerTelegramId: payload.managerTelegramId ?? null,
    expiresAt: payload.expiresAt ?? null,
  }).returning()

  const url = `${frontendUrl}/c/${token}`
  return mapCatalogLinkToDTO(row, url)
}

export async function updateLink(payload: {
  id: string
  clientName?: string
  label?: string
  categoryIds?: string[]
}) {
  const [existing] = await db
    .select()
    .from(catalogLinks)
    .where(and(eq(catalogLinks.id, payload.id), eq(catalogLinks.removed, false)))
    .limit(1)

  if (!existing)
    throw new HttpError(404, 'Link not found', 'CATALOG_LINK_NOT_FOUND')

  const [row] = await db.update(catalogLinks).set({
    clientName: payload.clientName ?? existing.clientName,
    label: payload.label ?? existing.label,
    categoryIds: payload.categoryIds ?? existing.categoryIds,
    updatedAt: sql`now()`,
  }).where(eq(catalogLinks.id, payload.id)).returning()

  return row
}

export async function softDeleteLink(id: string) {
  const [row] = await db
    .update(catalogLinks)
    .set({ removed: true, updatedAt: sql`now()` })
    .where(and(eq(catalogLinks.id, id), eq(catalogLinks.removed, false)))
    .returning()

  if (!row)
    throw new HttpError(404, 'Link not found', 'CATALOG_LINK_NOT_FOUND')

  return row
}

export async function findLinkById(id: string) {
  const [row] = await db
    .select()
    .from(catalogLinks)
    .where(and(eq(catalogLinks.id, id), eq(catalogLinks.removed, false)))
    .limit(1)
  return row ?? null
}

export async function listLinksByManager(managerTelegramId: string) {
  return db
    .select()
    .from(catalogLinks)
    .where(and(
      eq(catalogLinks.managerTelegramId, managerTelegramId),
      eq(catalogLinks.removed, false),
    ))
    .orderBy(desc(catalogLinks.createdAt))
}

export async function listSelectionsByLinkToken(linkToken: string) {
  const rows = await db
    .select({
      selection: photoSelections,
      photo: catalogPhotos,
      category: catalogCategories,
    })
    .from(photoSelections)
    .innerJoin(catalogPhotos, eq(photoSelections.photoId, catalogPhotos.id))
    .leftJoin(catalogCategories, eq(catalogPhotos.categoryId, catalogCategories.id))
    .where(and(
      eq(photoSelections.linkToken, linkToken),
      eq(photoSelections.removed, false),
      eq(catalogPhotos.removed, false),
    ))
    .orderBy(desc(photoSelections.updatedAt))

  return rows.map(({ selection, photo, category }) => ({
    photoId: photo.id,
    photoName: photo.name,
    categoryPath: category?.path ?? '',
    markers: selection.markers,
    updatedAt: selection.updatedAt,
  }))
}

function buildLinkOrder(sorters?: GetCatalogLinkRequest['sorters']) {
  const orders = []
  if (sorters?.clientName)
    orders.push(sorters.clientName === 'asc' ? asc(catalogLinks.clientName) : desc(catalogLinks.clientName))
  if (sorters?.createdAt)
    orders.push(sorters.createdAt === 'asc' ? asc(catalogLinks.createdAt) : desc(catalogLinks.createdAt))
  return orders.length ? orders : [desc(catalogLinks.createdAt)]
}

export async function listLinks(payload: GetCatalogLinkRequest, frontendUrl: string) {
  const { filters = {}, pagination = {}, sorters } = payload
  const { current, pageSize, offset } = resolvePagination(pagination)

  const conditions = [eq(catalogLinks.removed, false)]
  if (filters.catalogId)
    conditions.push(eq(catalogLinks.catalogId, filters.catalogId))
  if (filters.clientName)
    conditions.push(ilike(catalogLinks.clientName, `%${filters.clientName}%`))
  if (filters.managerTelegramId)
    conditions.push(eq(catalogLinks.managerTelegramId, filters.managerTelegramId))

  const where = and(...conditions)

  const [items, [{ total }]] = await Promise.all([
    db.select().from(catalogLinks).where(where).limit(pageSize).offset(offset).orderBy(...buildLinkOrder(sorters)),
    db.select({ total: count() }).from(catalogLinks).where(where),
  ])

  return {
    items: items.map(row => ({
      id: row.id,
      token: row.token,
      catalogId: row.catalogId,
      clientName: row.clientName,
      label: row.label,
      categoryIds: row.categoryIds,
      managerTelegramId: row.managerTelegramId,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
    })),
    total: Number(total),
    page: current,
    pageSize,
  }
}

function buildSelectionOrder(sorters?: GetSelectionRequest['sorters']) {
  const orders = []
  if (sorters?.clientName)
    orders.push(sorters.clientName === 'asc' ? asc(photoSelections.clientName) : desc(photoSelections.clientName))
  if (sorters?.updatedAt)
    orders.push(sorters.updatedAt === 'asc' ? asc(photoSelections.updatedAt) : desc(photoSelections.updatedAt))
  if (sorters?.createdAt)
    orders.push(sorters.createdAt === 'asc' ? asc(photoSelections.createdAt) : desc(photoSelections.createdAt))
  return orders.length ? orders : [desc(photoSelections.updatedAt)]
}

export async function listManagerSelections(payload: GetSelectionRequest) {
  const { filters = {}, pagination = {}, sorters } = payload
  const { current, pageSize, offset } = resolvePagination(pagination)

  const conditions = [eq(photoSelections.removed, false), eq(catalogs.removed, false), eq(catalogPhotos.removed, false)]
  if (filters.catalogId)
    conditions.push(eq(photoSelections.catalogId, filters.catalogId))
  if (filters.clientName)
    conditions.push(ilike(photoSelections.clientName, `%${filters.clientName}%`))
  if (filters.photoId)
    conditions.push(eq(photoSelections.photoId, filters.photoId))

  const where = and(...conditions)

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        selection: photoSelections,
        catalog: catalogs,
        photo: catalogPhotos,
      })
      .from(photoSelections)
      .innerJoin(catalogs, eq(photoSelections.catalogId, catalogs.id))
      .innerJoin(catalogPhotos, eq(photoSelections.photoId, catalogPhotos.id))
      .where(where)
      .limit(pageSize)
      .offset(offset)
      .orderBy(...buildSelectionOrder(sorters)),
    db
      .select({ total: count() })
      .from(photoSelections)
      .innerJoin(catalogs, eq(photoSelections.catalogId, catalogs.id))
      .innerJoin(catalogPhotos, eq(photoSelections.photoId, catalogPhotos.id))
      .where(where),
  ])

  return {
    items: rows.map(({ selection, catalog, photo }) => mapManagerSelectionToDTO(selection, catalog, photo)),
    total: Number(total),
    page: current,
    pageSize,
  }
}

export async function seedCatalog(payload: { slug: string, title: string, driveFolderId: string }) {
  const [existing] = await db
    .select()
    .from(catalogs)
    .where(eq(catalogs.slug, payload.slug))
    .limit(1)

  if (existing) {
    if (existing.driveFolderId !== payload.driveFolderId) {
      const [updated] = await db.update(catalogs).set({
        driveFolderId: payload.driveFolderId,
        updatedAt: sql`now()`,
      }).where(eq(catalogs.id, existing.id)).returning()
      return updated
    }
    return existing
  }

  const [row] = await db.insert(catalogs).values({
    slug: payload.slug,
    title: payload.title,
    driveFolderId: payload.driveFolderId,
    active: true,
  }).returning()

  return row
}

export { mapCatalogToDTO }
