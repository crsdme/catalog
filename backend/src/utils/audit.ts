import type { AuthUser } from '@catalog/shared'
import type { AuditLogChange } from '@catalog/shared'
import { db } from '@/db'
import { auditLogs } from '@/db/schema'

interface CreateAuditLogParams {
  resourceType: string
  resourceId: string
  action: string
  changes: AuditLogChange[]
  comment?: string
  resource?: unknown
  user?: AuthUser
}

export async function createAuditLog(params: CreateAuditLogParams) {
  await db.insert(auditLogs).values({
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    action: params.action,
    changes: params.changes as Array<{ path: string, before: unknown, after: unknown }>,
    comment: params.comment ?? '',
    resource: params.resource ?? null,
    createdById: params.user?.id,
  })
}

export function diffFields<T extends Record<string, unknown>>(
  before: T,
  after: T,
  fields: (keyof T)[],
): AuditLogChange[] {
  return fields
    .filter(field => before[field] !== after[field])
    .map(field => ({
      path: String(field),
      before: before[field],
      after: after[field],
    }))
}
