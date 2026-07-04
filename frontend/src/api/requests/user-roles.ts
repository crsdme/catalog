import type {
  CreateUserRoleRequest,
  CreateUserRoleResponse,
  EditUserRoleRequest,
  EditUserRoleResponse,
  GetUserRoleRequest,
  GetUserRolesResponse,
  RemoveUserRoleRequest,
  RemoveUserRolesResponse,
} from '@catalog/shared'
import { api } from '@/api/instance'

export async function getUserRoles(params: GetUserRoleRequest) {
  return api.get<GetUserRolesResponse>('user-roles/get', { params })
}

export async function createUserRole(params: CreateUserRoleRequest) {
  return api.post<CreateUserRoleResponse>('user-roles/create', params)
}

export async function editUserRole(params: EditUserRoleRequest) {
  return api.post<EditUserRoleResponse>('user-roles/edit', params)
}

export async function removeUserRole(params: RemoveUserRoleRequest) {
  return api.post<RemoveUserRolesResponse>('user-roles/remove', params)
}
