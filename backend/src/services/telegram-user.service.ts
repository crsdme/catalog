import type {
  CreateTelegramAllowedUserResponse,
  EditTelegramAllowedUserResponse,
  GetTelegramAllowedUsersResponse,
  RemoveTelegramAllowedUserResponse,
} from '@catalog/shared'
import type { AuthUser } from '@catalog/shared'
import * as TelegramUsersRepo from '@/repositories/telegram-users.repo'
import { invalidateTelegramAllowlistCache } from '@/services/telegram-allowlist.service'
import { createAuditLog } from '@/utils/audit'
import { HttpError } from '@/utils/httpError'

export async function get(payload: Parameters<typeof TelegramUsersRepo.list>[0]): Promise<GetTelegramAllowedUsersResponse> {
  const result = await TelegramUsersRepo.list(payload)
  return {
    status: 'success',
    code: 'TELEGRAM_USERS_FETCHED',
    message: 'Telegram users fetched',
    data: {
      items: result.items,
      pagination: { total: result.total, page: result.page, pageSize: result.pageSize },
    },
  }
}

export async function create(
  payload: Parameters<typeof TelegramUsersRepo.createOne>[0],
  user?: AuthUser,
): Promise<CreateTelegramAllowedUserResponse> {
  const row = await TelegramUsersRepo.createOne(payload)
  invalidateTelegramAllowlistCache()
  await createAuditLog({
    resourceType: 'telegramAllowedUser',
    resourceId: row.id,
    action: 'create',
    changes: [{ path: 'telegramId', before: null, after: row.telegramId }],
    user,
  })
  return {
    status: 'success',
    code: 'TELEGRAM_USER_CREATED',
    message: 'Telegram user created',
    data: row,
  }
}

export async function edit(
  payload: Parameters<typeof TelegramUsersRepo.updateById>[0],
  user?: AuthUser,
): Promise<EditTelegramAllowedUserResponse> {
  const row = await TelegramUsersRepo.updateById(payload)
  invalidateTelegramAllowlistCache()
  await createAuditLog({
    resourceType: 'telegramAllowedUser',
    resourceId: row.id,
    action: 'edit',
    changes: [{ path: 'telegramId', before: null, after: row.telegramId }],
    user,
  })
  return {
    status: 'success',
    code: 'TELEGRAM_USER_EDITED',
    message: 'Telegram user edited',
    data: row,
  }
}

export async function remove(ids: string[], user?: AuthUser): Promise<RemoveTelegramAllowedUserResponse> {
  if (!ids.length)
    throw new HttpError(400, 'Ids are required', 'INVALID_REQUEST')

  await TelegramUsersRepo.removeByIds(ids)
  invalidateTelegramAllowlistCache()
  await createAuditLog({
    resourceType: 'telegramAllowedUser',
    resourceId: ids[0],
    action: 'remove',
    changes: [],
    user,
  })
  return {
    status: 'success',
    code: 'TELEGRAM_USERS_REMOVED',
    message: 'Telegram users removed',
  }
}
