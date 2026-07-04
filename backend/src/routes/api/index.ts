import { Router } from 'express'
import { authenticateJWT } from '@/middleware/auth.middleware'
import auditLogsRoutes from './audit-logs.route'
import authRoutes from './auth.route'
import settingRoutes from './setting.route'
import storageRoutes from './storage.route'
import userRoleRoutes from './user-role.route'
import userRoutes from './user.route'

const router = Router()

router.use('/auth', authRoutes)

router.use(authenticateJWT)
router.use('/settings', settingRoutes)
router.use('/users', userRoutes)
router.use('/user-roles', userRoleRoutes)
router.use('/audit-logs', auditLogsRoutes)
router.use('/storage', storageRoutes)

export default router
