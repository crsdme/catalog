import type { NextFunction, Request, Response } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { STORAGE_PATHS } from '@/config/constants'

type UploadMode = 'single' | 'multiple'

interface UploadOptions {
  fieldName: string
  storageKey: keyof typeof STORAGE_PATHS
  mode?: UploadMode
  maxCount?: number
}

export function uploadMiddleware({
  fieldName,
  storageKey,
  mode = 'single',
  maxCount = 5,
}: UploadOptions) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      const folder = STORAGE_PATHS[storageKey]
      fs.mkdirSync(folder, { recursive: true })
      cb(null, folder)
    },
    filename: (_req, file, cb) => {
      const fileExt = path.extname(file.originalname)
      cb(null, `${uuidv4()}${fileExt}`)
    },
  })

  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
  })

  return (req: Request, res: Response, next: NextFunction) => {
    const handler = mode === 'multiple' ? upload.array(fieldName, maxCount) : upload.single(fieldName)

    handler(req, res, (err) => {
      if (err instanceof multer.MulterError || err instanceof Error)
        return res.status(400).json({ error: err.message })
      next()
    })
  }
}
