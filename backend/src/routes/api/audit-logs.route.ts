import type { RequestHandler } from 'express'
import { getAuditLogsSchema } from '@catalog/shared'
import { Router } from 'express'
import * as AuditLogsController from '@/controllers/audit-logs.controller'
import { checkPermissions, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  checkPermissions('auditLog.page'),
  validateQueryRequest(getAuditLogsSchema),
  AuditLogsController.get as unknown as RequestHandler,
)

export default router
