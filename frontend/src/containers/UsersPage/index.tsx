import type { UserPopulatedDTO } from '@catalog/shared'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { EntityDataTable, PermissionGate } from '@/components'
import { Badge, Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { useUserCreate, useUserEdit, useUserQuery, useUserRemove, useUserRoleOptions } from '@/api/hooks'
import { formatDate } from '@/utils/helpers/formatDate'
import { useListQueryState, useLocale } from '@/utils/hooks'

export function UsersPage() {
  const { t } = useLocale()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<UserPopulatedDTO | null>(null)
  const [form, setForm] = useState({ name: '', login: '', password: '', role: '', active: true })

  const { pagination, setPagination, filters, setFilters } = useListQueryState({
    readFilters: params => ({ name: params.get('name') ?? '' }),
    writeFilters: (params, f) => params.set('name', f.name ?? ''),
  })

  const { data, isLoading } = useUserQuery({ pagination, filters })
  const roleOptions = useUserRoleOptions()
  const createMutation = useUserCreate()
  const editMutation = useUserEdit()
  const removeMutation = useUserRemove()

  const columns = useMemo<ColumnDef<UserPopulatedDTO>[]>(() => [
    { accessorKey: 'seq', header: '#' },
    { accessorKey: 'name', header: t('page.users.table.name') },
    { accessorKey: 'login', header: t('page.users.table.login') },
    {
      id: 'role',
      header: t('page.users.table.role'),
      cell: ({ row }) => row.original.role.names.en ?? row.original.role.names.ru,
    },
    {
      id: 'active',
      header: t('page.users.table.active'),
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
          <PermissionGate permission={['user.edit']}>
            <Button size="sm" variant="outline" onClick={() => openEdit(row.original)}>{t('table.edit')}</Button>
          </PermissionGate>
          <PermissionGate permission={['user.remove']}>
            <Button size="sm" variant="destructive" onClick={() => removeMutation.mutate({ ids: [row.original.id] })}>{t('table.delete')}</Button>
          </PermissionGate>
        </div>
      ),
    },
  ], [t, removeMutation])

  function openCreate() {
    setEditing(null)
    setForm({ name: '', login: '', password: '', role: roleOptions.data?.[0]?.value ?? '', active: true })
    setDialogOpen(true)
  }

  function openEdit(user: UserPopulatedDTO) {
    setEditing(user)
    setForm({ name: user.name, login: user.login, password: '', role: user.role.id, active: user.active })
    setDialogOpen(true)
  }

  function submit() {
    if (editing) {
      editMutation.mutate({
        id: editing.id,
        name: form.name,
        login: form.login,
        role: form.role,
        active: form.active,
        ...(form.password ? { password: form.password } : {}),
      }, { onSuccess: () => setDialogOpen(false) })
    }
    else {
      createMutation.mutate({
        name: form.name,
        login: form.login,
        password: form.password,
        role: form.role,
        active: form.active,
      }, { onSuccess: () => setDialogOpen(false) })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('title.page.users')}</h1>
          <p className="text-muted-foreground">{t('description.page.users')}</p>
        </div>
        <PermissionGate permission={['user.create']}>
          <Button onClick={openCreate}>{t('button.create')}</Button>
        </PermissionGate>
      </div>

      <Input
        placeholder={t('page.users.filter.name')}
        value={filters.name ?? ''}
        onChange={e => setFilters({ name: e.target.value })}
        className="max-w-sm"
      />

      <EntityDataTable
        data={data?.users ?? []}
        columns={columns}
        total={data?.usersCount ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('page.users.form.edit') : t('page.users.form.create')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>{t('page.users.table.name')}</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>{t('page.users.table.login')}</Label>
              <Input value={form.login} onChange={e => setForm({ ...form, login: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>{t('page.users.table.password')}</Label>
              <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>{t('page.users.table.role')}</Label>
              <Select value={form.role} onValueChange={value => setForm({ ...form, role: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(roleOptions.data ?? []).map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
