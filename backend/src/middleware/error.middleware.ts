import type { NextFunction, Request, Response } from 'express'
import type { HttpError } from '@/utils/httpError'
import logger from '@/utils/logger'

export function errorHandler(err: HttpError, req: Request, res: Response, next: NextFunction): void {
  logger.error({
    message: err.message ?? 'Internal Server Error',
    code: err.code,
    statusCode: err.statusCode,
  })

  if (res.headersSent)
    return next(err)

  res.status(err.statusCode ?? 500).json({
    error: {
      code: err.code ?? 'INTERNAL_ERROR',
      message: err.message ?? 'Internal Server Error',
      description: err.description ?? '',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  })
}
