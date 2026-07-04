import type {
  CreateSettingResponse,
  EditSettingResponse,
  GetSettingsResponse,
  RemoveSettingResponse,
} from '@catalog/shared'
import type { AuthUser } from '@catalog/shared'
import * as SettingsRepo from '@/repositories/settings.repo'
import { createAuditLog } from '@/utils/audit'
import { HttpError } from '@/utils/httpError'
import { mapSettingToDTO } from '@/utils/mappers'

export async function get(payload: Parameters<typeof SettingsRepo.list>[0]): Promise<GetSettingsResponse> {
  const result = await SettingsRepo.list(payload)
  return {
    status: 'success',
    code: 'SETTINGS_FETCHED',
    message: 'Settings fetched',
    data: {
      items: result.items,
      pagination: { total: result.total, page: result.page, pageSize: result.pageSize },
    },
  }
}

export async function create(payload: Parameters<typeof SettingsRepo.createOne>[0], user?: AuthUser): Promise<CreateSettingResponse> {
  const row = await SettingsRepo.createOne(payload)
  await createAuditLog({
    resourceType: 'setting',
    resourceId: row.id,
    action: 'create',
    changes: [{ path: 'key', before: null, after: row.key }],
    user,
  })
  return {
    status: 'success',
    code: 'SETTING_CREATED',
    message: 'Setting created',
    data: mapSettingToDTO(row),
  }
}

export async function edit(payload: {
  id: string
  key: string
  value?: unknown
  scope?: string
  isPublic?: boolean
}, user?: AuthUser): Promise<EditSettingResponse> {
  const row = await SettingsRepo.updateById(payload.id, payload)
  if (!row)
    throw new HttpError(400, 'Setting not edited', 'SETTING_NOT_EDITED')

  await createAuditLog({
    resourceType: 'setting',
    resourceId: row.id,
    action: 'edit',
    changes: [{ path: 'value', before: null, after: row.value }],
    user,
  })

  return {
    status: 'success',
    code: 'SETTING_EDITED',
    message: 'Setting edited',
    data: mapSettingToDTO(row),
  }
}

export async function remove(id: string, user?: AuthUser): Promise<RemoveSettingResponse> {
  await SettingsRepo.removeById(id)
  await createAuditLog({
    resourceType: 'setting',
    resourceId: id,
    action: 'remove',
    changes: [],
    user,
  })
  return {
    status: 'success',
    code: 'SETTINGS_REMOVED',
    message: 'Settings removed',
  }
}
