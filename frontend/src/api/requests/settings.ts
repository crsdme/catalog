import type {
  CreateSettingRequest,
  CreateSettingResponse,
  EditSettingRequest,
  EditSettingResponse,
  GetSettingsRequest,
  GetSettingsResponse,
  RemoveSettingRequest,
  RemoveSettingResponse,
} from '@catalog/shared'
import { api } from '@/api/instance'

export async function getSettings(params: GetSettingsRequest) {
  return api.get<GetSettingsResponse>('settings/get', { params })
}

export async function createSetting(params: CreateSettingRequest) {
  return api.post<CreateSettingResponse>('settings/create', params)
}

export async function editSetting(params: EditSettingRequest) {
  return api.post<EditSettingResponse>('settings/edit', params)
}

export async function removeSetting(params: RemoveSettingRequest) {
  return api.post<RemoveSettingResponse>('settings/remove', params)
}
