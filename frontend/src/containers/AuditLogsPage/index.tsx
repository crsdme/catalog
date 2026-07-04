import type { AuditLogPopulatedDTO } from '@catalog/shared'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { EntityDataTable } from '@/components'
import { Badge } from '@/components/ui'
import { useAuditLogQuery } from '@/api/hooks'
import { formatDate } from '@/utils/helpers/formatDate'
import { useListQueryState, useLocale } from '@/utils/hooks'

export function AuditLogsPage() {
  const { t } = useLocale()
  const { pagination, setPagination } = useListQueryState({})
  const { data, isLoading } = useAuditLogQuery({ pagination })

  const columns = useMemo<ColumnDef<AuditLogPopulatedDTO>[]>(() => [
    {
      id: 'resource',
      header: t('page.auditLogs.table.resource'),
      cell: ({ row }) => `${row.original.resourceType} / ${row.original.resourceId}`,
    },
    {
      id: 'action',
      header: t('page.auditLogs.table.action'),
      cell: ({ row }) => <Badge variant="outline">{row.original.action}</Badge>,
    },
    {
      id: 'createdBy',
      header: t('page.auditLogs.table.createdBy'),
      cell: ({ row }) => row.original.createdBy.name,
    },
    {
      id: 'changes',
      header: t('page.auditLogs.table.changes'),
      cell: ({ row }) => row.original.changes.length,
    },
    {
      id: 'createdAt',
      header: t('table.createdAt'),
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ], [t])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t('title.page.auditLogs')}</h1>
        <p className="text-muted-foreground">{t('description.page.auditLogs')}</p>
      </div>

      <EntityDataTable
        data={data?.logs ?? []}
        columns={columns}
        total={data?.logsCount ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />
    </div>
  )
}
