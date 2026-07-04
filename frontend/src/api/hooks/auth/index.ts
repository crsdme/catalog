import type { LoginRequest } from '@catalog/shared'
import type { AxiosError, AxiosResponse } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { postAuthLogin, postAuthLogout } from '@/api/requests'

type LoginResponseData = AxiosResponse<{ user: {
  id: string
  login: string
  name: string
  permissions: string[]
  createdAt: Date
  updatedAt: Date
} }>

export function useAuthLogin(settings?: {
  options?: {
    onSuccess?: (data: LoginResponseData) => void
    onError?: (error: AxiosError<{ error?: { code: string, description?: string } }>) => void
  }
}) {
  return useMutation({
    mutationFn: (params: LoginRequest) => postAuthLogin(params),
    ...settings?.options,
  })
}

export function useAuthLogout(settings?: {
  options?: {
    onSuccess?: () => void
  }
}) {
  return useMutation({
    mutationFn: () => postAuthLogout(),
    ...settings?.options,
  })
}

export { useRefreshToken } from './useRefreshToken'
