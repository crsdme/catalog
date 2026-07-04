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
import type { AuthUser } from '@catalog/shared'
import * as UsersRepo from '@/repositories/users.repo'
import { createAuditLog } from '@/utils/audit'
import { HttpError } from '@/utils/httpError'

export async function get(payload: GetUserRequest): Promise<GetUsersResponse> {
  const result = await UsersRepo.list(payload)
  return {
    status: 'success',
    code: 'USERS_FETCHED',
    message: 'Users fetched',
    data: {
      items: result.items,
      pagination: { total: result.total, page: result.page, pageSize: result.pageSize },
    },
  }
}

export async function create(payload: CreateUserRequest, user?: AuthUser): Promise<CreateUserResponse> {
  const row = await UsersRepo.createOne(payload)
  await createAuditLog({
    resourceType: 'user',
    resourceId: row.id,
    action: 'create',
    changes: [{ path: 'login', before: null, after: row.login }],
    user,
  })
  return {
    status: 'success',
    code: 'USER_CREATED',
    message: 'User created',
    data: {
      id: row.id,
      seq: row.seq,
      name: row.name,
      login: row.login,
      roleId: row.roleId,
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    },
  }
}

export async function edit(payload: EditUserRequest, user?: AuthUser): Promise<EditUserResponse> {
  const before = await UsersRepo.findById(payload.id)
  const row = await UsersRepo.updateById(payload)
  if (!row)
    throw new HttpError(400, 'User not edited', 'USER_NOT_EDITED')

  await createAuditLog({
    resourceType: 'user',
    resourceId: row.id,
    action: 'edit',
    changes: before
      ? [{ path: 'login', before: before.login, after: row.login }]
      : [],
    user,
  })

  return {
    status: 'success',
    code: 'USER_EDITED',
    message: 'User edited',
    data: {
      id: row.id,
      seq: row.seq,
      name: row.name,
      login: row.login,
      roleId: row.roleId,
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    },
  }
}

export async function remove(payload: RemoveUserRequest, user?: AuthUser): Promise<RemoveUserResponse> {
  await UsersRepo.removeByIds(payload.ids)
  for (const id of payload.ids) {
    await createAuditLog({
      resourceType: 'user',
      resourceId: id,
      action: 'remove',
      changes: [],
      user,
    })
  }
  return {
    status: 'success',
    code: 'USERS_REMOVED',
    message: 'Users removed',
  }
}
