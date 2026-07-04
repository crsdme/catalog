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
import type { AuthUser } from '@catalog/shared'
import * as UserRolesRepo from '@/repositories/user-roles.repo'
import { createAuditLog } from '@/utils/audit'
import { HttpError } from '@/utils/httpError'

export async function get(payload: GetUserRoleRequest): Promise<GetUserRolesResponse> {
  const result = await UserRolesRepo.list(payload)
  return {
    status: 'success',
    code: 'USER_ROLES_FETCHED',
    message: 'User roles fetched',
    data: {
      items: result.items,
      pagination: { total: result.total, page: result.page, pageSize: result.pageSize },
    },
  }
}

export async function create(payload: CreateUserRoleRequest, user?: AuthUser): Promise<CreateUserRoleResponse> {
  const data = await UserRolesRepo.createOne(payload)
  await createAuditLog({
    resourceType: 'user-role',
    resourceId: data.id,
    action: 'create',
    changes: [{ path: 'permissions', before: null, after: data.permissions }],
    user,
  })
  return {
    status: 'success',
    code: 'USER_ROLE_CREATED',
    message: 'User role created',
    data,
  }
}

export async function edit(payload: EditUserRoleRequest, user?: AuthUser): Promise<EditUserRoleResponse> {
  const before = await UserRolesRepo.findById(payload.id)
  const data = await UserRolesRepo.updateById(payload)
  if (!data)
    throw new HttpError(400, 'User role not edited', 'USER_ROLE_NOT_EDITED')

  await createAuditLog({
    resourceType: 'user-role',
    resourceId: data.id,
    action: 'edit',
    changes: before
      ? [{ path: 'permissions', before: before.permissions, after: data.permissions }]
      : [],
    user,
  })

  return {
    status: 'success',
    code: 'USER_ROLE_EDITED',
    message: 'User role edited',
    data,
  }
}

export async function remove(payload: RemoveUserRoleRequest, user?: AuthUser): Promise<RemoveUserRolesResponse> {
  await UserRolesRepo.removeByIds(payload.ids)
  for (const id of payload.ids) {
    await createAuditLog({
      resourceType: 'user-role',
      resourceId: id,
      action: 'remove',
      changes: [],
      user,
    })
  }
  return {
    status: 'success',
    code: 'USER_ROLES_REMOVED',
    message: 'User roles removed',
  }
}
