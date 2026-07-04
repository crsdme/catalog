import type { CreateUserRequest, EditUserRequest, GetUserRequest } from '@catalog/shared'
import { and, asc, count, desc, eq, ilike, inArray, sql } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import { db } from '@/db'
import { userRoles, users } from '@/db/schema'
import { HttpError } from '@/utils/httpError'
import { mapUserPopulatedToDTO } from '@/utils/mappers'
import { resolvePagination } from '@/utils/pagination'

function buildUserOrder(sorters?: GetUserRequest['sorters']) {
  if (!sorters)
    return [desc(users.createdAt)]

  const orders = []
  if (sorters.name)
    orders.push(sorters.name === 'asc' ? asc(users.name) : desc(users.name))
  if (sorters.login)
    orders.push(sorters.login === 'asc' ? asc(users.login) : desc(users.login))
  if (sorters.active)
    orders.push(sorters.active === 'asc' ? asc(users.active) : desc(users.active))
  if (sorters.createdAt)
    orders.push(sorters.createdAt === 'asc' ? asc(users.createdAt) : desc(users.createdAt))
  if (sorters.updatedAt)
    orders.push(sorters.updatedAt === 'asc' ? asc(users.updatedAt) : desc(users.updatedAt))

  return orders.length ? orders : [desc(users.createdAt)]
}

export async function list(payload: GetUserRequest) {
  const { filters = {}, pagination = {}, sorters } = payload
  const { current, pageSize, offset } = resolvePagination(pagination)

  const conditions = [eq(users.removed, false), eq(userRoles.removed, false)]
  if (filters.name)
    conditions.push(ilike(users.name, `%${filters.name}%`))
  if (filters.login)
    conditions.push(ilike(users.login, `%${filters.login}%`))
  if (filters.role)
    conditions.push(eq(users.roleId, filters.role))
  if (Array.isArray(filters.active) && filters.active.length)
    conditions.push(inArray(users.active, filters.active))

  const where = and(...conditions)

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({ user: users, role: userRoles })
      .from(users)
      .innerJoin(userRoles, eq(users.roleId, userRoles.id))
      .where(where)
      .limit(pageSize)
      .offset(offset)
      .orderBy(...buildUserOrder(sorters)),
    db
      .select({ total: count() })
      .from(users)
      .innerJoin(userRoles, eq(users.roleId, userRoles.id))
      .where(where),
  ])

  return {
    items: rows.map(({ user, role }) => mapUserPopulatedToDTO(user, role)),
    total: Number(total),
    page: current,
    pageSize,
  }
}

export async function findOneByLogin(login: string) {
  const rows = await db
    .select({ user: users, role: userRoles })
    .from(users)
    .innerJoin(userRoles, eq(users.roleId, userRoles.id))
    .where(and(eq(users.login, login), eq(users.removed, false), eq(userRoles.removed, false)))
    .limit(1)

  if (!rows[0])
    return null

  return {
    ...rows[0].user,
    role: rows[0].role,
  }
}

export async function findById(id: string) {
  const rows = await db
    .select({ user: users, role: userRoles })
    .from(users)
    .innerJoin(userRoles, eq(users.roleId, userRoles.id))
    .where(and(eq(users.id, id), eq(users.removed, false)))
    .limit(1)

  if (!rows[0])
    return null

  return mapUserPopulatedToDTO(rows[0].user, rows[0].role)
}

export async function createOne(payload: CreateUserRequest) {
  const sameLogin = await db.select().from(users).where(and(eq(users.login, payload.login), eq(users.removed, false))).limit(1)
  if (sameLogin.length > 0)
    throw new HttpError(409, 'User already exists', 'USER_ALREADY_EXISTS')

  const hashedPassword = await bcrypt.hash(payload.password, 10)

  const [row] = await db.insert(users).values({
    name: payload.name,
    login: payload.login,
    password: hashedPassword,
    roleId: payload.role,
    active: payload.active ?? true,
  }).returning()

  return row
}

export async function updateById(payload: EditUserRequest) {
  const updateData: Record<string, unknown> = {
    name: payload.name,
    login: payload.login,
    roleId: payload.role,
    active: payload.active,
    updatedAt: new Date(),
  }

  if (payload.password)
    updateData.password = await bcrypt.hash(payload.password, 10)

  const [row] = await db.update(users).set(updateData).where(and(eq(users.id, payload.id), eq(users.removed, false))).returning()
  return row ?? null
}

export async function removeByIds(ids: string[]) {
  await db.update(users).set({ removed: true, updatedAt: sql`now()` }).where(inArray(users.id, ids))
}
