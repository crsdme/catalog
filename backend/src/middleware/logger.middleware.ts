import type { NextFunction, Request, Response } from 'express'
import logger from '@/utils/logger'

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  logger.info(`${req.method} ${req.url}`)
  next()
}
