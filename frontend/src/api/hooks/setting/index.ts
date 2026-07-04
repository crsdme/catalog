import type { GetSettingsRequest } from '@catalog/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSetting, editSetting, getSettings, removeSetting } from '@/api/requests'
import type { CreateSettingRequest, EditSettingRequest, RemoveSettingRequest } from '@catalog/shared'

export function useSettingQuery(payload: GetSettingsRequest) {
  return useQuery({
    queryKey: ['settings', payload],
    queryFn: () => getSettings(payload),
    select: res => ({
      settings: res.data.data.items,
      settingsCount: res.data.data.pagination.total,
    }),
  })
}

export function useSettingCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSettingRequest) => createSetting(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  })
}

export function useSettingEdit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: EditSettingRequest) => editSetting(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  })
}

export function useSettingRemove() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RemoveSettingRequest) => removeSetting(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  })
}
