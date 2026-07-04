import type { SettingDTO, UserPopulatedDTO, UserRoleDTO } from '@catalog/shared'
import type { Setting, User, UserRole } from '@/db/schema'

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
