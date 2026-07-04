import '@/config/env'
import { connectDB } from '@/config/db'
import { env } from '@/config/env'
import { initStorageDirectories } from '@/config/init'
import { startTelegramBot } from '@/bot'
import app from '@/index'
import * as TelegramUsersRepo from '@/repositories/telegram-users.repo'
import logger from '@/utils/logger'

const PORT = process.env.PORT ?? 5000

async function bootstrap() {
  initStorageDirectories()
  await connectDB()

  if (env.telegramAllowedUserIds.length)
    await TelegramUsersRepo.seedFromEnv(env.telegramAllowedUserIds)

  app.listen(PORT, () => {
    logger.info(`[Server] Started port ${PORT}`)
    startTelegramBot()
  })
}

void bootstrap()
