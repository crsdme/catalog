import type {
  CatalogCategoryDTO,
  CatalogDTO,
  CatalogPhotoDTO,
  CatalogLinkDTO,
  ManagerSelectionDTO,
  PhotoSelectionDTO,
  SettingDTO,
  TelegramAllowedUserDTO,
  UserPopulatedDTO,
  UserRoleDTO,
} from '@catalog/shared'
import type { Catalog, CatalogCategory, CatalogLink, CatalogPhoto, PhotoSelection, Setting, TelegramAllowedUser, User, UserRole } from '@/db/schema'

export function mapSettingToDTO(row: Setting): SettingDTO {
  return {
    id: row.id,
    key: row.key,
    value: row.value,
    scope: row.scope ?? undefined,
    description: row.description ?? undefined,
    isPublic: row.isPublic,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function mapTelegramAllowedUserToDTO(row: TelegramAllowedUser): TelegramAllowedUserDTO {
  return {
    id: row.id,
    telegramId: row.telegramId,
    label: row.label,
    active: row.active,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function mapUserRoleToDTO(row: UserRole): UserRoleDTO {
  return {
    id: row.id,
    names: row.names,
    permissions: row.permissions,
    priority: row.priority,
    active: row.active,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function mapUserPopulatedToDTO(
  user: User,
  role: UserRole,
): UserPopulatedDTO {
  return {
    id: user.id,
    seq: user.seq,
    name: user.name,
    login: user.login,
    role: mapUserRoleToDTO(role),
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export function stringifySettingValue(value: unknown): string {
  if (value === null || value === undefined)
    return ''
  if (typeof value === 'string')
    return value
  return JSON.stringify(value)
}

export function mapCatalogToDTO(row: Catalog): CatalogDTO {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    active: row.active,
  }
}

export function mapCatalogCategoryToDTO(row: CatalogCategory): CatalogCategoryDTO {
  return {
    id: row.id,
    name: row.name,
    path: row.path,
    depth: row.depth,
  }
}

export function mapCatalogPhotoToDTO(row: CatalogPhoto, categoryPath = ''): CatalogPhotoDTO {
  return {
    id: row.id,
    driveFileId: row.driveFileId,
    name: row.name,
    sortOrder: row.sortOrder,
    categoryId: row.categoryId,
    categoryPath,
  }
}

export function mapPhotoSelectionToDTO(row: PhotoSelection): PhotoSelectionDTO {
  return {
    photoId: row.photoId,
    markers: row.markers,
    updatedAt: row.updatedAt,
  }
}

export function mapCatalogLinkToDTO(row: CatalogLink, url: string): CatalogLinkDTO {
  return {
    id: row.id,
    token: row.token,
    catalogId: row.catalogId,
    clientName: row.clientName,
    label: row.label,
    categoryIds: row.categoryIds,
    managerTelegramId: row.managerTelegramId,
    expiresAt: row.expiresAt,
    url,
    createdAt: row.createdAt,
  }
}

export function mapManagerSelectionToDTO(
  selection: PhotoSelection,
  catalog: Catalog,
  photo: CatalogPhoto,
): ManagerSelectionDTO {
  return {
    id: selection.id,
    clientName: selection.clientName,
    catalog: mapCatalogToDTO(catalog),
    photo: mapCatalogPhotoToDTO(photo),
    markers: selection.markers,
    linkToken: selection.linkToken,
    updatedAt: selection.updatedAt,
    createdAt: selection.createdAt,
  }
}
