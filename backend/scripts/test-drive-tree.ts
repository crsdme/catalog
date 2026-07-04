import dotenv from 'dotenv'
import { connectDB } from '../src/config/db'
import { env } from '../src/config/env'
import * as DriveService from '../src/services/drive.service'

dotenv.config()

async function main() {
  await connectDB()
  console.log('folder:', env.googleDriveFolderId)
  const contents = await DriveService.listFolderContents(env.googleDriveFolderId)
  console.log('folders:', contents.folders.length, contents.folders.slice(0, 10))
  console.log('images:', contents.images.length)
}

main().catch(console.error)
