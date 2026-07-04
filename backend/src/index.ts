import '@/config/env'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { env } from '@/config/env'
import { helmetConfig } from '@/config/helmet'
import { errorHandler } from '@/middleware/error.middleware'
import { requestLogger } from '@/middleware/logger.middleware'
import apiRoutes from '@/routes/api'
import healthRoutes from '@/routes/health'
import storageRoutes from '@/routes/storage'

const app = express()

app.set('query parser', 'extended')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
)
app.use(helmetConfig)
app.use(requestLogger)

app.use('/api', apiRoutes)
app.use('/health', healthRoutes)
app.use('/storage', storageRoutes)

app.use(errorHandler)

export default app
