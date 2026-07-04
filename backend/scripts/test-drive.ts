import dotenv from 'dotenv'
import { env } from '../src/config/env'
import * as DriveService from '../src/services/drive.service'

dotenv.config()

async function main() {
  console.log('json length:', env.googleServiceAccountJson.length)
  console.log('folder:', env.googleDriveFolderId)
  console.log('configured:', DriveService.isDriveConfigured())

  try {
    JSON.parse(env.googleServiceAccountJson)
    console.log('json parse: ok')
  }
  catch (error) {
    console.error('json parse failed:', (error as Error).message)
    process.exit(1)
  }

  const files = await DriveService.listImagesInFolder(env.googleDriveFolderId)
  console.log('files found:', files.length)
  console.log(files.slice(0, 5))
}

main().catch((error) => {
  console.error('drive error:', error.message)
  if (error.response?.data)
    console.error(error.response.data)
  process.exit(1)
})
