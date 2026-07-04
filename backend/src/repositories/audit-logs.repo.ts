import type { GetAuditLogsRequest } from '@catalog/shared'
import { and, asc, count, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm'
import { db } from '@/db'
import { auditLogs, users } from '@/db/schema'
import { resolvePagination } from '@/utils/pagination'

function buildAuditOrder(sorters?: GetAuditLogsRequest['sorters']) {
  const orders = []
  if (sorters?.resourceType)
    orders.push(sorters.resourceType === 'asc' ? asc(auditLogs.resourceType) : desc(auditLogs.resourceType))
  if (sorters?.action)
    orders.push(sorters.action === 'asc' ? asc(auditLogs.action) : desc(auditLogs.action))
  if (sorters?.createdAt)
    orders.push(sorters.createdAt === 'asc' ? asc(auditLogs.createdAt) : desc(auditLogs.createdAt))
  return orders.length ? orders : [desc(auditLogs.createdAt)]
}

export async function list(payload: GetAuditLogsRequest) {
  const { filters = {}, pagination = {}, sorters } = payload
  const { current, pageSize, offset } = resolvePagination(pagination)

  const conditions = []
  if (filters.resourceType?.length)
    conditions.push(inArray(auditLogs.resourceType, filters.resourceType))
  if (filters.resourceId?.length)
    conditions.push(inArray(auditLogs.resourceId, filters.resourceId))
  if (filters.action?.length)
    conditions.push(inArray(auditLogs.action, filters.action))
  if (filters.createdAt?.from)
    conditions.push(gte(auditLogs.createdAt, filters.createdAt.from))
  if (filters.createdAt?.to)
    conditions.push(lte(auditLogs.createdAt, filters.createdAt.to))

  const where = conditions.length ? and(...conditions) : undefined

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        log: auditLogs,
        creatorName: users.name,
        creatorId: users.id,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.createdById, users.id))
      .where(where)
      .limit(pageSize)
      .offset(offset)
      .orderBy(...buildAuditOrder(sorters)),
    db.select({ total: count() }).from(auditLogs).where(where),
  ])

  return {
    items: rows.map(({ log, creatorName, creatorId }) => ({
      id: log.id,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      resource: log.resource,
      action: log.action,
      changes: log.changes,
      comment: log.comment,
      createdBy: {
        id: creatorId ?? 'system',
        name: creatorName ?? 'System',
      },
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    })),
    total: Number(total),
    page: current,
    pageSize,
  }
}
