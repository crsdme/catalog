import type { LoginRequest, LoginResponse, RefreshResponse } from '@catalog/shared'
import { api } from '@/api/instance'

export async function postAuthLogin(params: LoginRequest) {
  return api.post<{ user: LoginResponse['user'] }>('auth/login', params)
}

export const postRefreshToken = async () => api.post<RefreshResponse>('auth/refresh')

export const postAuthLogout = async () => api.post('auth/logout')
