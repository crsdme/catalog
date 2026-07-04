import type { CreateUserRoleRequest, EditUserRoleRequest, GetUserRoleRequest } from '@catalog/shared'
import { and, asc, count, desc, eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/db'
import { userRoles } from '@/db/schema'
import { mapUserRoleToDTO } from '@/utils/mappers'
import { resolvePagination } from '@/utils/pagination'

function buildRoleOrder(sorters?: GetUserRoleRequest['sorters']) {
  const orders = []
  if (sorters?.priority)
    orders.push(sorters.priority === 'asc' ? asc(userRoles.priority) : desc(userRoles.priority))
  if (sorters?.active)
    orders.push(sorters.active === 'asc' ? asc(userRoles.active) : desc(userRoles.active))
  if (sorters?.createdAt)
    orders.push(sorters.createdAt === 'asc' ? asc(userRoles.createdAt) : desc(userRoles.createdAt))
  return orders.length ? orders : [desc(userRoles.priority)]
}

export async function list(payload: GetUserRoleRequest) {
  const { filters = {}, pagination = {}, sorters } = payload
  const { current, pageSize, offset } = resolvePagination(pagination)

  const conditions = [eq(userRoles.removed, false)]
  if (filters.names)
    conditions.push(sql`${userRoles.names}::text ILIKE ${`%${filters.names}%`}`)
  if (Array.isArray(filters.active) && filters.active.length)
    conditions.push(inArray(userRoles.active, filters.active))

  const where = and(...conditions)

  const [items, [{ total }]] = await Promise.all([
    db.select().from(userRoles).where(where).limit(pageSize).offset(offset).orderBy(...buildRoleOrder(sorters)),
    db.select({ total: count() }).from(userRoles).where(where),
  ])

  return {
    items: items.map(mapUserRoleToDTO),
    total: Number(total),
    page: current,
    pageSize,
  }
}

export async function findById(id: string) {
  const [row] = await db.select().from(userRoles).where(and(eq(userRoles.id, id), eq(userRoles.removed, false))).limit(1)
  return row ? mapUserRoleToDTO(row) : null
}

export async function createOne(payload: CreateUserRoleRequest) {
  const [row] = await db.insert(userRoles).values({
    names: payload.names,
    permissions: payload.permissions,
    priority: payload.priority,
    active: payload.active ?? true,
  }).returning()

  return mapUserRoleToDTO(row)
}

export async function updateById(payload: EditUserRoleRequest) {
  const [row] = await db.update(userRoles).set({
    names: payload.names,
    permissions: payload.permissions,
    priority: payload.priority,
    active: payload.active,
    updatedAt: sql`now()`,
  }).where(and(eq(userRoles.id, payload.id), eq(userRoles.removed, false))).returning()

  return row ? mapUserRoleToDTO(row) : null
}

export async function removeByIds(ids: string[]) {
  await db.update(userRoles).set({ removed: true, updatedAt: sql`now()` }).where(inArray(userRoles.id, ids))
}

export async function createAdminRole() {
  const [row] = await db.insert(userRoles).values({
    names: { en: 'admin', ru: 'админ' },
    priority: 1,
    permissions: ['other.admin', 'dashboard.page', 'user.page', 'user.create', 'user.edit', 'user.remove', 'userRole.page', 'userRole.create', 'userRole.edit', 'userRole.remove', 'settings.page', 'settings.create', 'settings.edit', 'settings.remove', 'auditLog.page', 'storage.upload', 'catalog.link.create', 'catalog.link.read', 'selection.view'],
    active: true,
  }).returning()
  return row
}
