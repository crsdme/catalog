import type {
  CreateUserRequest,
  CreateUserResponse,
  EditUserRequest,
  EditUserResponse,
  GetUserRequest,
  GetUsersResponse,
  RemoveUserRequest,
  RemoveUserResponse,
} from '@catalog/shared'
import { api } from '@/api/instance'

export async function getUsers(params: GetUserRequest) {
  return api.get<GetUsersResponse>('users/get', { params })
}

export async function createUser(params: CreateUserRequest) {
  return api.post<CreateUserResponse>('users/create', params)
}

export async function editUser(params: EditUserRequest) {
  return api.post<EditUserResponse>('users/edit', params)
}

export async function removeUser(params: RemoveUserRequest) {
  return api.post<RemoveUserResponse>('users/remove', params)
}
