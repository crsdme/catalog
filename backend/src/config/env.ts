import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'

dotenv.config()

function loadGoogleServiceAccountJson() {
  const inline = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim()
  if (inline)
    return inline

  const filePath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH?.trim()
  if (!filePath)
    return ''

  const resolved = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath)

  if (!fs.existsSync(resolved)) {
    console.warn(`[env] GOOGLE_SERVICE_ACCOUNT_PATH not found: ${resolved}`)
    return ''
  }

  return fs.readFileSync(resolved, 'utf8').trim()
}

export const env = {
  port: Number(process.env.PORT ?? 5000),
  frontendUrl: process.env.FRONTEND_URL?.replace(/\/$/, ''),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '12h',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  googleServiceAccountJson: loadGoogleServiceAccountJson(),
  googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID ?? '',
  catalogSyncIntervalMinutes: Number(process.env.CATALOG_SYNC_INTERVAL_MINUTES ?? 5),
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
  telegramAllowedUserIds: (process.env.TELEGRAM_ALLOWED_USER_IDS ?? '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean),
  defaultCatalogSlug: process.env.DEFAULT_CATALOG_SLUG ?? 'lux-001',
} as const
