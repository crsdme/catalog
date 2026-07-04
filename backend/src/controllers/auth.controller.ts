import type { CookieOptions } from 'express'
import type { NextFunction, Request, Response } from 'express'
import type { LoginPayload, ValidatedRequest } from '@/types'
import { env } from '@/config/env'
import * as AuthService from '@/services/auth.service'

const cookieBase: CookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  path: '/',
}

export async function login(
  req: ValidatedRequest<unknown, LoginPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { accessToken, refreshToken, user } = await AuthService.login(req.validated!.body)

    res.cookie('refreshToken', refreshToken, {
      ...cookieBase,
      maxAge: 12 * 60 * 60 * 1000,
    })

    res.cookie('accessToken', accessToken, {
      ...cookieBase,
      maxAge: 15 * 60 * 1000,
    })

    res.status(200).json({ user })
  }
  catch (err) {
    next(err)
  }
}

export async function logout(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.clearCookie('accessToken', cookieBase)
    res.clearCookie('refreshToken', cookieBase)
    res.status(200).json({ message: 'Logged out' })
  }
  catch (err) {
    next(err)
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const refreshToken = req.cookies?.refreshToken

    if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
      res.sendStatus(403)
      return
    }

    const { accessToken, permissions } = await AuthService.refresh({ refreshToken })

    res.cookie('accessToken', accessToken, {
      ...cookieBase,
      maxAge: 15 * 60 * 1000,
    })

    res.status(200).json({ status: 'success', permissions })
  }
  catch (err) {
    next(err)
  }
}
