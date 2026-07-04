import { Router } from 'express'
import { authenticateJWT } from '@/middleware/auth.middleware'
import auditLogsRoutes from './audit-logs.route'
import authRoutes from './auth.route'
import catalogLinkRoutes from './catalog-link.route'
import publicRoutes from './public.route'
import selectionRoutes from './selection.route'
import settingRoutes from './setting.route'
import storageRoutes from './storage.route'
import telegramUserRoutes from './telegram-user.route'
import userRoleRoutes from './user-role.route'
import userRoutes from './user.route'

const router = Router()

router.use('/auth', authRoutes)
router.use('/public', publicRoutes)

router.use(authenticateJWT)
router.use('/settings', settingRoutes)
router.use('/telegram-users', telegramUserRoutes)
router.use('/users', userRoutes)
router.use('/user-roles', userRoleRoutes)
router.use('/audit-logs', auditLogsRoutes)
router.use('/storage', storageRoutes)
router.use('/catalog-links', catalogLinkRoutes)
router.use('/selections', selectionRoutes)

export default router
