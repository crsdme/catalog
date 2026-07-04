import type { GetAuditLogsRequest, GetAuditLogsResponse } from '@catalog/shared'
import * as AuditLogsRepo from '@/repositories/audit-logs.repo'

export async function get(payload: GetAuditLogsRequest): Promise<GetAuditLogsResponse> {
  const result = await AuditLogsRepo.list(payload)
  return {
    status: 'success',
    code: 'AUDIT_LOGS_FETCHED',
    message: 'Audit logs fetched',
    data: {
      items: result.items,
      pagination: { total: result.total, page: result.page, pageSize: result.pageSize },
    },
  }
}
