import '@/config/env'
import { connectDB } from '@/config/db'
import { initStorageDirectories } from '@/config/init'
import app from '@/index'
import logger from '@/utils/logger'

const PORT = process.env.PORT ?? 5000

async function bootstrap() {
  initStorageDirectories()
  await connectDB()
  app.listen(PORT, () => {
    logger.info(`[Server] Started port ${PORT}`)
  })
}

void bootstrap()
