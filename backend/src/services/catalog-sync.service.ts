import { eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/db'
import { catalogCategories, catalogPhotos, catalogs } from '@/db/schema'
import * as DriveService from '@/services/drive.service'

const ROOT_CATEGORY_PATH = '_root'
const ROOT_CATEGORY_NAME = 'General'

export interface SyncResult {
  categories: number
  photos: number
  folders: number
}

interface SyncCategoryRow {
  id: string
  path: string
}

export async function syncCatalogTree(catalogId: string, rootDriveFolderId: string): Promise<SyncResult> {
  const existingCategories = await db
    .select()
    .from(catalogCategories)
    .where(eq(catalogCategories.catalogId, catalogId))

  const existingPhotos = await db
    .select()
    .from(catalogPhotos)
    .where(eq(catalogPhotos.catalogId, catalogId))

  const categoryByDriveId = new Map(existingCategories.map(row => [row.driveFolderId, row]))
  const photoByDriveId = new Map(existingPhotos.map(row => [row.driveFileId, row]))
  const syncedCategoryDriveIds = new Set<string>()
  const syncedPhotoDriveIds = new Set<string>()
  const allCategories: SyncCategoryRow[] = []
  let totalFolders = 0
  let totalPhotos = 0

  async function upsertCategory(
    driveFolderId: string,
    parentCategoryId: string | null,
    path: string,
    name: string,
    depth: number,
    sortOrder: number,
  ) {
    syncedCategoryDriveIds.add(driveFolderId)
    const slug = DriveService.normalizeSlug(name)
    const existing = categoryByDriveId.get(driveFolderId)
    if (existing) {
      await db.update(catalogCategories).set({
        name,
        slug,
        path,
        parentId: parentCategoryId,
        depth,
        sortOrder,
        removed: false,
        updatedAt: sql`now()`,
      }).where(eq(catalogCategories.id, existing.id))
      allCategories.push({ id: existing.id, path })
      return existing.id
    }

    const [inserted] = await db.insert(catalogCategories).values({
      catalogId,
      parentId: parentCategoryId,
      name,
      slug,
      path,
      driveFolderId,
      depth,
      sortOrder,
    }).returning()
    categoryByDriveId.set(driveFolderId, inserted)
    allCategories.push({ id: inserted.id, path })
    return inserted.id
  }

  async function walkFolder(
    driveFolderId: string,
    parentCategoryId: string | null,
    pathPrefix: string,
    depth: number,
    sortOffset: number,
  ) {
    const { folders, images } = await DriveService.listFolderContents(driveFolderId)
    totalFolders += folders.length
    totalPhotos += images.length

    let categoryId = parentCategoryId

    if (pathPrefix) {
      categoryId = await upsertCategory(
        driveFolderId,
        parentCategoryId,
        pathPrefix,
        pathPrefix.split('/').pop() ?? pathPrefix,
        depth,
        sortOffset,
      )
    }
    else if (images.length > 0) {
      categoryId = await upsertCategory(
        driveFolderId,
        null,
        ROOT_CATEGORY_PATH,
        ROOT_CATEGORY_NAME,
        0,
        0,
      )
    }

    for (const [index, image] of images.entries()) {
      syncedPhotoDriveIds.add(image.fileId)
      const existing = photoByDriveId.get(image.fileId)
      if (existing) {
        await db.update(catalogPhotos).set({
          categoryId,
          name: image.name,
          sortOrder: index,
          removed: false,
          updatedAt: sql`now()`,
        }).where(eq(catalogPhotos.id, existing.id))
      }
      else {
        const [inserted] = await db.insert(catalogPhotos).values({
          catalogId,
          categoryId,
          driveFileId: image.fileId,
          name: image.name,
          sortOrder: index,
        }).returning()
        photoByDriveId.set(image.fileId, inserted)
      }
    }

    for (const [index, folder] of folders.entries()) {
      const childPath = pathPrefix ? `${pathPrefix}/${folder.name}` : folder.name
      await walkFolder(folder.fileId, categoryId, childPath, depth + 1, index)
    }
  }

  await walkFolder(rootDriveFolderId, null, '', 0, 0)

  const categoriesToRemove = existingCategories
    .filter(row => row.driveFolderId && !syncedCategoryDriveIds.has(row.driveFolderId) && !row.removed)
  if (categoriesToRemove.length) {
    await db.update(catalogCategories)
      .set({ removed: true, updatedAt: sql`now()` })
      .where(inArray(catalogCategories.id, categoriesToRemove.map(row => row.id)))
  }

  const photosToRemove = existingPhotos
    .filter(row => !syncedPhotoDriveIds.has(row.driveFileId) && !row.removed)
  if (photosToRemove.length) {
    await db.update(catalogPhotos)
      .set({ removed: true, updatedAt: sql`now()` })
      .where(inArray(catalogPhotos.id, photosToRemove.map(row => row.id)))
  }

  await db.update(catalogs)
    .set({ lastSyncedAt: sql`now()`, updatedAt: sql`now()` })
    .where(eq(catalogs.id, catalogId))

  return {
    categories: allCategories.length,
    photos: syncedPhotoDriveIds.size,
    folders: totalFolders,
  }
}

export function expandCategoryScope(
  categories: Array<{ id: string, path: string }>,
  selectedIds: string[],
) {
  if (!selectedIds.length)
    return new Set<string>()

  return new Set(
    categories
      .filter(category => selectedIds.includes(category.id))
      .map(category => category.id),
  )
}
