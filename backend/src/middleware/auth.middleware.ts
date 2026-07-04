import type { NextFunction, Request, Response } from 'express'
import { authUserSchema } from '@catalog/shared'
import jwt from 'jsonwebtoken'
import { env } from '@/config/env'

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const { accessToken } = req.cookies

  if (typeof accessToken !== 'string' || accessToken.length === 0)
    return res.sendStatus(401)

  jwt.verify(accessToken, env.jwtSecret, (err, decoded) => {
    if (err || typeof decoded !== 'object' || decoded === null)
      return res.sendStatus(401)

    const parsed = authUserSchema.safeParse(decoded)

    if (!parsed.success)
      return res.sendStatus(401)

    req.user = parsed.data
    next()
  })
}

export function refreshJWT(req: Request, res: Response, next: NextFunction) {
  const { refreshToken } = req.cookies
  if (typeof refreshToken !== 'string' || refreshToken.length === 0)
    return res.sendStatus(403)

  jwt.verify(refreshToken, env.jwtSecret, (err) => {
    if (err)
      return res.sendStatus(403)
    next()
  })
}
