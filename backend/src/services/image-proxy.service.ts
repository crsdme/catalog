import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { STORAGE_PATHS } from '@/config/constants'
import * as DriveService from '@/services/drive.service'

export interface ImageProxyOptions {
  width?: number
  quality?: number
}

function parseIntParam(value: unknown, fallback: number) {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export function parseImageProxyQuery(query: Record<string, unknown>): ImageProxyOptions {
  const width = query.w !== undefined ? parseIntParam(query.w, 0) : undefined
  const quality = Math.min(95, Math.max(50, parseIntParam(query.q, 80)))

  return {
    width: width && width > 0 ? Math.min(width, 2560) : undefined,
    quality,
  }
}

function cacheKey(fileId: string, options: ImageProxyOptions) {
  return `${fileId}-w${options.width ?? 'orig'}-q${options.quality ?? 80}.webp`
}

async function streamToBuffer(stream: NodeJS.ReadableStream) {
  const chunks: Buffer[] = []
  for await (const chunk of stream)
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  return Buffer.concat(chunks)
}

export async function getOptimizedDriveImage(fileId: string, options: ImageProxyOptions) {
  fs.mkdirSync(STORAGE_PATHS.driveCache, { recursive: true })

  const key = cacheKey(fileId, options)
  const cachedPath = path.join(STORAGE_PATHS.driveCache, key)

  if (fs.existsSync(cachedPath))
    return fs.readFileSync(cachedPath)

  const { stream } = await DriveService.getFileStream(fileId)
  const input = await streamToBuffer(stream)

  let pipeline = sharp(input).rotate()

  if (options.width)
    pipeline = pipeline.resize({ width: options.width, withoutEnlargement: true })

  const output = await pipeline
    .webp({ quality: options.quality ?? 80, effort: 4 })
    .toBuffer()

  fs.writeFileSync(cachedPath, output)
  return output
}
