import type { TelegramAllowedUserDTO } from '@catalog/shared'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { EntityDataTable, PermissionGate } from '@/components'
import { Badge, Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input, Label, Switch } from '@/components/ui'
import { useTelegramUserCreate, useTelegramUserEdit, useTelegramUserQuery, useTelegramUserRemove } from '@/api/hooks/telegram-user'
import { formatDate } from '@/utils/helpers/formatDate'
import { useListQueryState, useLocale } from '@/utils/hooks'

export function TelegramUsersPage() {
  const { t } = useLocale()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TelegramAllowedUserDTO | null>(null)
  const [form, setForm] = useState({ telegramId: '', label: '', active: true })

  const { pagination, setPagination, filters, setFilters } = useListQueryState({
    readFilters: params => ({
      telegramId: params.get('telegramId') ?? '',
      label: params.get('label') ?? '',
    }),
    writeFilters: (params, f) => {
      if (f.telegramId)
        params.set('telegramId', f.telegramId)
      else
        params.delete('telegramId')
      if (f.label)
        params.set('label', f.label)
      else
        params.delete('label')
    },
  })

  const { data, isLoading } = useTelegramUserQuery({ pagination, filters })
  const createMutation = useTelegramUserCreate()
  const editMutation = useTelegramUserEdit()
  const removeMutation = useTelegramUserRemove()

  const columns = useMemo<ColumnDef<TelegramAllowedUserDTO>[]>(() => [
    { accessorKey: 'telegramId', header: t('page.telegramUsers.table.telegramId') },
    { accessorKey: 'label', header: t('page.telegramUsers.table.label') },
    {
      id: 'active',
      header: t('page.telegramUsers.table.active'),
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
          <PermissionGate permission={['settings.edit']}>
            <Button size="sm" variant="outline" onClick={() => openEdit(row.original)}>{t('table.edit')}</Button>
          </PermissionGate>
          <PermissionGate permission={['settings.remove']}>
            <Button size="sm" variant="destructive" onClick={() => removeMutation.mutate({ ids: [row.original.id] })}>{t('table.delete')}</Button>
          </PermissionGate>
        </div>
      ),
    },
  ], [t, removeMutation])

  function openCreate() {
    setEditing(null)
    setForm({ telegramId: '', label: '', active: true })
    setDialogOpen(true)
  }

  function openEdit(user: TelegramAllowedUserDTO) {
    setEditing(user)
    setForm({ telegramId: user.telegramId, label: user.label, active: user.active })
    setDialogOpen(true)
  }

  function submit() {
    if (editing) {
      editMutation.mutate({
        id: editing.id,
        telegramId: form.telegramId,
        label: form.label,
        active: form.active,
      }, { onSuccess: () => setDialogOpen(false) })
    }
    else {
      createMutation.mutate({
        telegramId: form.telegramId,
        label: form.label,
        active: form.active,
      }, { onSuccess: () => setDialogOpen(false) })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('title.page.telegramUsers')}</h1>
          <p className="text-muted-foreground">{t('description.page.telegramUsers')}</p>
        </div>
        <PermissionGate permission={['settings.create']}>
          <Button onClick={openCreate}>{t('button.create')}</Button>
        </PermissionGate>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder={t('page.telegramUsers.filter.telegramId')}
          value={filters.telegramId ?? ''}
          onChange={e => setFilters({ ...filters, telegramId: e.target.value })}
          className="max-w-sm"
        />
        <Input
          placeholder={t('page.telegramUsers.filter.label')}
          value={filters.label ?? ''}
          onChange={e => setFilters({ ...filters, label: e.target.value })}
          className="max-w-sm"
        />
      </div>

      <EntityDataTable
        data={data?.users ?? []}
        columns={columns}
        isLoading={isLoading}
        pagination={pagination}
        onPaginationChange={setPagination}
        rowCount={data?.usersCount ?? 0}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('page.telegramUsers.dialog.edit') : t('page.telegramUsers.dialog.create')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telegramId">{t('page.telegramUsers.form.telegramId')}</Label>
              <Input
                id="telegramId"
                inputMode="numeric"
                placeholder="1126652631"
                value={form.telegramId}
                onChange={e => setForm({ ...form, telegramId: e.target.value.replace(/\D/g, '') })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">{t('page.telegramUsers.form.label')}</Label>
              <Input
                id="label"
                placeholder={t('page.telegramUsers.form.labelPlaceholder')}
                value={form.label}
                onChange={e => setForm({ ...form, label: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="active">{t('page.telegramUsers.form.active')}</Label>
              <Switch
                id="active"
                checked={form.active}
                onCheckedChange={active => setForm({ ...form, active })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('button.cancel')}</Button>
            <Button onClick={submit} disabled={!form.telegramId}>{t('button.submit')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
