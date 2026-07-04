import { google } from 'googleapis'
import { Readable } from 'node:stream'
import { env } from '@/config/env'
import { HttpError } from '@/utils/httpError'

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/heic',
  'image/heif',
])

export interface DriveImageFile {
  fileId: string
  name: string
  mimeType: string
}

let driveClient: ReturnType<typeof google.drive> | null = null

function getDriveClient() {
  if (driveClient)
    return driveClient

  if (!env.googleServiceAccountJson) {
    throw new HttpError(
      503,
      'Google Drive is not configured',
      'GOOGLE_DRIVE_NOT_CONFIGURED',
    )
  }

  let credentials: Record<string, unknown>
  try {
    credentials = JSON.parse(env.googleServiceAccountJson) as Record<string, unknown>
  }
  catch {
    throw new HttpError(
      503,
      'Invalid Google service account JSON',
      'GOOGLE_DRIVE_INVALID_CREDENTIALS',
    )
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })

  driveClient = google.drive({ version: 'v3', auth })
  return driveClient
}

export function isDriveConfigured() {
  return Boolean(env.googleServiceAccountJson)
}

const FOLDER_MIME = 'application/vnd.google-apps.folder'

export interface DriveFolder {
  fileId: string
  name: string
}

export interface DriveFolderContents {
  folders: DriveFolder[]
  images: DriveImageFile[]
}

function normalizeSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export { normalizeSlug }

export async function listFolderContents(folderId: string): Promise<DriveFolderContents> {
  const drive = getDriveClient()
  const folders: DriveFolder[] = []
  const images: DriveImageFile[] = []
  let pageToken: string | undefined

  do {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType)',
      pageSize: 100,
      pageToken,
      orderBy: 'name',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    })

    for (const file of response.data.files ?? []) {
      if (!file.id || !file.mimeType)
        continue
      if (file.mimeType === FOLDER_MIME) {
        folders.push({ fileId: file.id, name: file.name ?? file.id })
        continue
      }
      if (!IMAGE_MIME_TYPES.has(file.mimeType))
        continue
      images.push({
        fileId: file.id,
        name: file.name ?? file.id,
        mimeType: file.mimeType,
      })
    }

    pageToken = response.data.nextPageToken ?? undefined
  } while (pageToken)

  return { folders, images }
}

export async function listImagesInFolder(folderId: string): Promise<DriveImageFile[]> {
  const { images } = await listFolderContents(folderId)
  return images
}

export async function getFileStream(fileId: string): Promise<{ stream: Readable, mimeType: string }> {
  const drive = getDriveClient()

  const meta = await drive.files.get({
    fileId,
    fields: 'mimeType',
    supportsAllDrives: true,
  })

  const response = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'stream' },
  )

  return {
    stream: response.data as Readable,
    mimeType: meta.data.mimeType ?? 'application/octet-stream',
  }
}
