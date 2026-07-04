import type { GetSettingsRequest } from '@catalog/shared'
import { and, asc, count, desc, eq, ilike, sql } from 'drizzle-orm'
import { db } from '@/db'
import { settings } from '@/db/schema'
import { HttpError } from '@/utils/httpError'
import { mapSettingToDTO, stringifySettingValue } from '@/utils/mappers'
import { resolvePagination } from '@/utils/pagination'

export async function listPublic() {
  const rows = await db
    .select()
    .from(settings)
    .where(and(eq(settings.isPublic, true), eq(settings.removed, false)))

  return rows.map(row => ({ key: row.key, value: row.value }))
}

export async function list(payload: GetSettingsRequest) {
  const { filters = {}, pagination = {} } = payload
  const { current, pageSize, offset } = resolvePagination(pagination)

  const conditions = [eq(settings.removed, false)]
  if (filters.key)
    conditions.push(ilike(settings.key, `%${filters.key}%`))
  if (filters.scope)
    conditions.push(eq(settings.scope, filters.scope))
  if (filters.isPublic !== undefined)
    conditions.push(eq(settings.isPublic, filters.isPublic))
  if (filters.description)
    conditions.push(ilike(settings.description, `%${filters.description}%`))

  const where = and(...conditions)

  const [items, [{ total }]] = await Promise.all([
    db.select().from(settings).where(where).limit(pageSize).offset(offset).orderBy(asc(settings.key)),
    db.select({ total: count() }).from(settings).where(where),
  ])

  return {
    items: items.map(mapSettingToDTO),
    total: Number(total),
    page: current,
    pageSize,
  }
}

export async function createOne(payload: {
  key: string
  value?: unknown
  scope?: string
  description?: string
  isPublic?: boolean
}) {
  const existing = await db.select().from(settings).where(eq(settings.key, payload.key)).limit(1)
  if (existing.length > 0)
    throw new HttpError(409, 'Setting already exists', 'SETTING_ALREADY_EXISTS')

  const [row] = await db.insert(settings).values({
    key: payload.key,
    value: stringifySettingValue(payload.value),
    scope: payload.scope,
    description: payload.description,
    isPublic: payload.isPublic ?? false,
  }).returning()

  return row
}

export async function updateById(id: string, payload: {
  key: string
  value?: unknown
  scope?: string
  isPublic?: boolean
}) {
  const [row] = await db.update(settings).set({
    key: payload.key,
    value: payload.value !== undefined ? stringifySettingValue(payload.value) : undefined,
    scope: payload.scope,
    isPublic: payload.isPublic,
    updatedAt: sql`now()`,
  }).where(and(eq(settings.id, id), eq(settings.removed, false))).returning()

  return row ?? null
}

export async function removeById(id: string) {
  await db.update(settings).set({ removed: true, updatedAt: sql`now()` }).where(eq(settings.id, id))
}

export async function seedDefaults(defaults: Array<{
  key: string
  value: unknown
  scope?: string
  description?: string
  isPublic?: boolean
}>) {
  for (const item of defaults) {
    const existing = await db.select({ id: settings.id }).from(settings).where(eq(settings.key, item.key)).limit(1)
    if (existing.length === 0) {
      await db.insert(settings).values({
        key: item.key,
        value: stringifySettingValue(item.value),
        scope: item.scope,
        description: item.description,
        isPublic: item.isPublic ?? false,
      })
    }
  }
}
