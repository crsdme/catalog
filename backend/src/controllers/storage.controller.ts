import type { NextFunction, Request, Response } from 'express'

export async function upload(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file
    if (!file)
      return res.status(400).json({ error: 'No file uploaded' })

    res.status(201).json({
      status: 'success',
      code: 'FILE_UPLOADED',
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/storage/uploads/${file.filename}`,
      },
    })
  }
  catch (err) {
    next(err)
  }
}
