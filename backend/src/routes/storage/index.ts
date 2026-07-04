import { Router } from 'express'
import express from 'express'
import path from 'node:path'
import { STORAGE_PATHS } from '@/config/constants'

const router = Router()

router.use('/uploads', express.static(path.join(STORAGE_PATHS.uploads)))

export default router
