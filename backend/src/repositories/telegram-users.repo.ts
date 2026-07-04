import type {
  CreateTelegramAllowedUserRequest,
  EditTelegramAllowedUserRequest,
  GetTelegramAllowedUserRequest,
} from '@catalog/shared'
import { and, asc, count, desc, eq, ilike, inArray, sql } from 'drizzle-orm'
import { db } from '@/db'
import { telegramAllowedUsers } from '@/db/schema'
import { HttpError } from '@/utils/httpError'
import { mapTelegramAllowedUserToDTO } from '@/utils/mappers'
import { resolvePagination } from '@/utils/pagination'

function buildOrder(sorters?: GetTelegramAllowedUserRequest['sorters']) {
  if (!sorters)
    return [desc(telegramAllowedUsers.createdAt)]

  const orders = []
  if (sorters.telegramId)
    orders.push(sorters.telegramId === 'asc' ? asc(telegramAllowedUsers.telegramId) : desc(telegramAllowedUsers.telegramId))
  if (sorters.label)
    orders.push(sorters.label === 'asc' ? asc(telegramAllowedUsers.label) : desc(telegramAllowedUsers.label))
  if (sorters.active)
    orders.push(sorters.active === 'asc' ? asc(telegramAllowedUsers.active) : desc(telegramAllowedUsers.active))
  if (sorters.createdAt)
    orders.push(sorters.createdAt === 'asc' ? asc(telegramAllowedUsers.createdAt) : desc(telegramAllowedUsers.createdAt))

  return orders.length ? orders : [desc(telegramAllowedUsers.createdAt)]
}

export async function list(payload: GetTelegramAllowedUserRequest) {
  const { filters = {}, pagination = {}, sorters } = payload
  const { current, pageSize, offset } = resolvePagination(pagination)

  const conditions = [eq(telegramAllowedUsers.removed, false)]
  if (filters.telegramId)
    conditions.push(ilike(telegramAllowedUsers.telegramId, `%${filters.telegramId}%`))
  if (filters.label)
    conditions.push(ilike(telegramAllowedUsers.label, `%${filters.label}%`))
  if (Array.isArray(filters.active) && filters.active.length)
    conditions.push(inArray(telegramAllowedUsers.active, filters.active))

  const where = and(...conditions)

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(telegramAllowedUsers).where(where).limit(pageSize).offset(offset).orderBy(...buildOrder(sorters)),
    db.select({ total: count() }).from(telegramAllowedUsers).where(where),
  ])

  return {
    items: rows.map(mapTelegramAllowedUserToDTO),
    total: Number(total),
    page: current,
    pageSize,
  }
}

export async function listActiveTelegramIds() {
  const rows = await db
    .select({ telegramId: telegramAllowedUsers.telegramId })
    .from(telegramAllowedUsers)
    .where(and(eq(telegramAllowedUsers.removed, false), eq(telegramAllowedUsers.active, true)))

  return rows.map(row => row.telegramId)
}

export async function findById(id: string) {
  const [row] = await db
    .select()
    .from(telegramAllowedUsers)
    .where(and(eq(telegramAllowedUsers.id, id), eq(telegramAllowedUsers.removed, false)))
    .limit(1)

  return row ? mapTelegramAllowedUserToDTO(row) : null
}

export async function createOne(payload: CreateTelegramAllowedUserRequest) {
  const [existing] = await db
    .select()
    .from(telegramAllowedUsers)
    .where(eq(telegramAllowedUsers.telegramId, payload.telegramId))
    .limit(1)

  if (existing) {
    if (!existing.removed)
      throw new HttpError(409, 'Telegram user already exists', 'TELEGRAM_USER_ALREADY_EXISTS')

    const [row] = await db.update(telegramAllowedUsers).set({
      label: payload.label ?? '',
      active: payload.active ?? true,
      removed: false,
      updatedAt: sql`now()`,
    }).where(eq(telegramAllowedUsers.id, existing.id)).returning()

    return mapTelegramAllowedUserToDTO(row)
  }

  const [row] = await db.insert(telegramAllowedUsers).values({
    telegramId: payload.telegramId,
    label: payload.label ?? '',
    active: payload.active ?? true,
  }).returning()

  return mapTelegramAllowedUserToDTO(row)
}

export async function updateById(payload: EditTelegramAllowedUserRequest) {
  const [duplicate] = await db
    .select()
    .from(telegramAllowedUsers)
    .where(and(
      eq(telegramAllowedUsers.telegramId, payload.telegramId),
      eq(telegramAllowedUsers.removed, false),
    ))
    .limit(1)

  if (duplicate && duplicate.id !== payload.id)
    throw new HttpError(409, 'Telegram user already exists', 'TELEGRAM_USER_ALREADY_EXISTS')

  const [row] = await db.update(telegramAllowedUsers).set({
    telegramId: payload.telegramId,
    label: payload.label ?? '',
    active: payload.active ?? true,
    updatedAt: sql`now()`,
  }).where(and(eq(telegramAllowedUsers.id, payload.id), eq(telegramAllowedUsers.removed, false))).returning()

  if (!row)
    throw new HttpError(404, 'Telegram user not found', 'TELEGRAM_USER_NOT_FOUND')

  return mapTelegramAllowedUserToDTO(row)
}

export async function removeByIds(ids: string[]) {
  await db
    .update(telegramAllowedUsers)
    .set({ removed: true, updatedAt: sql`now()` })
    .where(and(inArray(telegramAllowedUsers.id, ids), eq(telegramAllowedUsers.removed, false)))
}

export async function seedFromEnv(telegramIds: string[]) {
  for (const telegramId of telegramIds) {
    const [existing] = await db
      .select()
      .from(telegramAllowedUsers)
      .where(eq(telegramAllowedUsers.telegramId, telegramId))
      .limit(1)

    if (existing)
      continue

    await db.insert(telegramAllowedUsers).values({
      telegramId,
      label: 'Imported from env',
      active: true,
    })
  }
}
