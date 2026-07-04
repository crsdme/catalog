import type { NextFunction, Response } from 'express'
import type { GetAuditLogsRequest } from '@catalog/shared'
import type { ValidatedRequest } from '@/types'
import * as AuditLogsService from '@/services/audit-logs.service'

export async function get(req: ValidatedRequest<GetAuditLogsRequest>, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await AuditLogsService.get(req.validated?.query ?? {})
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
