import type {
  CreateTelegramAllowedUserRequest,
  CreateTelegramAllowedUserResponse,
  EditTelegramAllowedUserRequest,
  EditTelegramAllowedUserResponse,
  GetTelegramAllowedUserRequest,
  GetTelegramAllowedUsersResponse,
  RemoveTelegramAllowedUserRequest,
  RemoveTelegramAllowedUserResponse,
} from '@catalog/shared'
import { api } from '@/api/instance'

export async function getTelegramUsers(params: GetTelegramAllowedUserRequest) {
  return api.get<GetTelegramAllowedUsersResponse>('telegram-users/get', { params })
}

export async function createTelegramUser(params: CreateTelegramAllowedUserRequest) {
  return api.post<CreateTelegramAllowedUserResponse>('telegram-users/create', params)
}

export async function editTelegramUser(params: EditTelegramAllowedUserRequest) {
  return api.post<EditTelegramAllowedUserResponse>('telegram-users/edit', params)
}

export async function removeTelegramUsers(params: RemoveTelegramAllowedUserRequest) {
  return api.post<RemoveTelegramAllowedUserResponse>('telegram-users/remove', params)
}
