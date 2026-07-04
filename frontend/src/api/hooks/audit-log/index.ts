import type { GetAuditLogsRequest } from '@catalog/shared'
import { useQuery } from '@tanstack/react-query'
import { getAuditLogs } from '@/api/requests'

export function useAuditLogQuery(payload: GetAuditLogsRequest) {
  return useQuery({
    queryKey: ['audit-logs', payload],
    queryFn: () => getAuditLogs(payload),
    select: res => ({
      logs: res.data.data.items,
      logsCount: res.data.data.pagination.total,
    }),
  })
}
