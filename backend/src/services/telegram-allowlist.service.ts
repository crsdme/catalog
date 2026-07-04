import { env } from '@/config/env'
import * as TelegramUsersRepo from '@/repositories/telegram-users.repo'

let cachedIds: string[] | null = null
let cacheExpiresAt = 0
const CACHE_TTL_MS = 30_000

export function invalidateTelegramAllowlistCache() {
  cachedIds = null
  cacheExpiresAt = 0
}

export async function getAllowedTelegramIds() {
  const now = Date.now()
  if (cachedIds && now < cacheExpiresAt)
    return cachedIds

  const dbIds = await TelegramUsersRepo.listActiveTelegramIds()
  cachedIds = dbIds.length ? dbIds : env.telegramAllowedUserIds
  cacheExpiresAt = now + CACHE_TTL_MS
  return cachedIds
}

export async function isTelegramUserAllowed(telegramId: number | string) {
  const allowedIds = await getAllowedTelegramIds()
  if (!allowedIds.length)
    return true

  return allowedIds.includes(String(telegramId))
}
