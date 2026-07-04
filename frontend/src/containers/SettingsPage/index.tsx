import type { SettingDTO } from '@catalog/shared'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { EntityDataTable, PermissionGate } from '@/components'
import { Badge, Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input, Label, Switch } from '@/components/ui'
import { useSettingCreate, useSettingEdit, useSettingQuery, useSettingRemove, useFileUpload } from '@/api/hooks'
import { backendUrl } from '@/utils/constants'
import { formatDate } from '@/utils/helpers/formatDate'
import { useListQueryState, useLocale } from '@/utils/hooks'

export function SettingsPage() {
  const { t } = useLocale()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<SettingDTO | null>(null)
  const [form, setForm] = useState({ key: '', value: '', scope: '', description: '', isPublic: false })
  const [uploadResult, setUploadResult] = useState<string | null>(null)

  const { pagination, setPagination } = useListQueryState({})
  const { data, isLoading } = useSettingQuery({ pagination })
  const createMutation = useSettingCreate()
  const editMutation = useSettingEdit()
  const removeMutation = useSettingRemove()
  const uploadMutation = useFileUpload()

  const columns = useMemo<ColumnDef<SettingDTO>[]>(() => [
    { accessorKey: 'key', header: t('page.settings.table.key') },
    { accessorKey: 'value', header: t('page.settings.table.value') },
    { accessorKey: 'scope', header: t('page.settings.table.scope') },
    {
      id: 'isPublic',
      header: t('page.settings.table.isPublic'),
      cell: ({ row }) => (
        <Badge variant={row.original.isPublic ? 'default' : 'secondary'}>
          {row.original.isPublic ? t('table.yesno.true') : t('table.yesno.false')}
        </Badge>
      ),
    },
    {
      id: 'updatedAt',
      header: t('table.updatedAt'),
      cell: ({ row }) => formatDate(row.original.updatedAt),
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
            <Button size="sm" variant="destructive" onClick={() => removeMutation.mutate({ id: row.original.id })}>{t('table.delete')}</Button>
          </PermissionGate>
        </div>
      ),
    },
  ], [t, removeMutation])

  function openCreate() {
    setEditing(null)
    setForm({ key: '', value: '', scope: '', description: '', isPublic: false })
    setDialogOpen(true)
  }

  function openEdit(setting: SettingDTO) {
    setEditing(setting)
    setForm({
      key: setting.key,
      value: setting.value,
      scope: setting.scope ?? '',
      description: setting.description ?? '',
      isPublic: setting.isPublic,
    })
    setDialogOpen(true)
  }

  function submit() {
    const payload = {
      key: form.key,
      value: form.value,
      scope: form.scope || undefined,
      description: form.description || undefined,
      isPublic: form.isPublic,
    }

    if (editing) {
      editMutation.mutate({ id: editing.id, ...payload }, { onSuccess: () => setDialogOpen(false) })
    }
    else {
      createMutation.mutate(payload, { onSuccess: () => setDialogOpen(false) })
    }
  }

  function handleUpload(file: File) {
    uploadMutation.mutate(file, {
      onSuccess: (res) => {
        const url = backendUrl
          ? `${backendUrl.replace(/\/$/, '')}${res.data.data.url}`
          : res.data.data.url
        setUploadResult(url)
      },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('title.page.settings')}</h1>
          <p className="text-muted-foreground">{t('description.page.settings')}</p>
        </div>
        <PermissionGate permission={['settings.create']}>
          <Button onClick={openCreate}>{t('button.create')}</Button>
        </PermissionGate>
      </div>

      <PermissionGate permission={['storage.upload']}>
        <div className="rounded-md border p-4 space-y-2">
          <h2 className="font-medium">{t('page.settings.upload.title')}</h2>
          <Input type="file" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          {uploadResult && <p className="text-sm break-all text-muted-foreground">{uploadResult}</p>}
        </div>
      </PermissionGate>

      <EntityDataTable
        data={data?.settings ?? []}
        columns={columns}
        total={data?.settingsCount ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('page.settings.form.edit') : t('page.settings.form.create')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>{t('page.settings.table.key')}</Label>
              <Input value={form.key} onChange={e => setForm({ ...form, key: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>{t('page.settings.table.value')}</Label>
              <Input value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>{t('page.settings.table.scope')}</Label>
              <Input value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isPublic} onCheckedChange={checked => setForm({ ...form, isPublic: checked })} />
              <Label>{t('page.settings.table.isPublic')}</Label>
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
