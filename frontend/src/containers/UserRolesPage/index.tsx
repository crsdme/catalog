import type { UserRoleDTO } from '@catalog/shared'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { EntityDataTable, PermissionGate } from '@/components'
import { Badge, Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input, Label, Textarea } from '@/components/ui'
import { useUserRoleCreate, useUserRoleEdit, useUserRoleQuery, useUserRoleRemove } from '@/api/hooks'
import { USER_ROLE_PERMISSIONS } from '@/utils/constants'
import { formatDate } from '@/utils/helpers/formatDate'
import { useListQueryState, useLocale } from '@/utils/hooks'

export function UserRolesPage() {
  const { t } = useLocale()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<UserRoleDTO | null>(null)
  const [form, setForm] = useState({
    namesEn: '',
    namesRu: '',
    priority: 0,
    permissions: 'other.admin',
    active: true,
  })

  const { pagination, setPagination } = useListQueryState({})
  const { data, isLoading } = useUserRoleQuery({ pagination })
  const createMutation = useUserRoleCreate()
  const editMutation = useUserRoleEdit()
  const removeMutation = useUserRoleRemove()

  const columns = useMemo<ColumnDef<UserRoleDTO>[]>(() => [
    {
      id: 'name',
      header: t('page.userRoles.table.name'),
      cell: ({ row }) => row.original.names.en ?? row.original.names.ru,
    },
    {
      id: 'permissions',
      header: t('page.userRoles.table.permissions'),
      cell: ({ row }) => row.original.permissions.join(', '),
    },
    { accessorKey: 'priority', header: t('page.userRoles.table.priority') },
    {
      id: 'active',
      header: t('page.userRoles.table.active'),
      cell: ({ row }) => (
        <Badge variant={row.original.active ? 'default' : 'secondary'}>
          {row.original.active ? t('table.active.true') : t('table.active.false')}
        </Badge>
      ),
    },
    {
      id: 'createdAt',
      header: t('table.createdAt'),
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <PermissionGate permission={['userRole.edit']}>
            <Button size="sm" variant="outline" onClick={() => openEdit(row.original)}>{t('table.edit')}</Button>
          </PermissionGate>
          <PermissionGate permission={['userRole.remove']}>
            <Button size="sm" variant="destructive" onClick={() => removeMutation.mutate({ ids: [row.original.id] })}>{t('table.delete')}</Button>
          </PermissionGate>
        </div>
      ),
    },
  ], [t, removeMutation])

  function openCreate() {
    setEditing(null)
    setForm({ namesEn: '', namesRu: '', priority: 0, permissions: 'user.page', active: true })
    setDialogOpen(true)
  }

  function openEdit(role: UserRoleDTO) {
    setEditing(role)
    setForm({
      namesEn: role.names.en ?? '',
      namesRu: role.names.ru ?? '',
      priority: role.priority,
      permissions: role.permissions.join(', '),
      active: role.active,
    })
    setDialogOpen(true)
  }

  function submit() {
    const payload = {
      names: { en: form.namesEn, ru: form.namesRu },
      priority: Number(form.priority),
      permissions: form.permissions.split(',').map(p => p.trim()).filter(Boolean),
      active: form.active,
    }

    if (editing) {
      editMutation.mutate({ id: editing.id, ...payload }, { onSuccess: () => setDialogOpen(false) })
    }
    else {
      createMutation.mutate(payload, { onSuccess: () => setDialogOpen(false) })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('title.page.userRoles')}</h1>
          <p className="text-muted-foreground">{t('description.page.userRoles')}</p>
        </div>
        <PermissionGate permission={['userRole.create']}>
          <Button onClick={openCreate}>{t('button.create')}</Button>
        </PermissionGate>
      </div>

      <details className="rounded-md border p-4 text-sm">
        <summary className="cursor-pointer font-medium">{t('page.userRoles.permissionsHint')}</summary>
        <ul className="mt-2 space-y-1 text-muted-foreground">
          {USER_ROLE_PERMISSIONS.map(group => (
            <li key={group.group}>
              <strong>{group.group}:</strong>
              {' '}
              {group.permissions.join(', ')}
            </li>
          ))}
        </ul>
      </details>

      <EntityDataTable
        data={data?.roles ?? []}
        columns={columns}
        total={data?.rolesCount ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t('page.userRoles.form.edit') : t('page.userRoles.form.create')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>{t('page.userRoles.form.nameEn')}</Label>
              <Input value={form.namesEn} onChange={e => setForm({ ...form, namesEn: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>{t('page.userRoles.form.nameRu')}</Label>
              <Input value={form.namesRu} onChange={e => setForm({ ...form, namesRu: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>{t('page.userRoles.table.priority')}</Label>
              <Input type="number" value={form.priority} onChange={e => setForm({ ...form, priority: Number(e.target.value) })} />
            </div>
            <div className="grid gap-2">
              <Label>{t('page.userRoles.table.permissions')}</Label>
              <Textarea value={form.permissions} onChange={e => setForm({ ...form, permissions: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('button.cancel')}</Button>
            <Button onClick={submit}>{t('button.submit')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
