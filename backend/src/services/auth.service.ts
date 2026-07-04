import type { LoginResponse, RefreshResponse } from '@catalog/shared'
import type { LoginPayload, RefreshPayload, TokenPayload } from '@/types'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { env } from '@/config/env'
import * as SettingsRepo from '@/repositories/settings.repo'
import * as UserRepository from '@/repositories/users.repo'
import { HttpError } from '@/utils'

function generateRefreshToken(data: TokenPayload) {
  return jwt.sign(data, env.jwtSecret, { expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'] })
}

function generateAccessToken(data: TokenPayload) {
  return jwt.sign(data, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] })
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const user = await UserRepository.findOneByLogin(payload.login)

  if (!user) {
    throw new HttpError(400, 'User not found', 'INVALID_CREDENTIALS')
  }

  const isMatch = await bcrypt.compare(payload.password, user.password)

  if (!isMatch) {
    throw new HttpError(400, 'Invalid password', 'INVALID_CREDENTIALS')
  }

  const permissions = user.role.permissions ?? []

  const accessToken = generateAccessToken({
    id: user.id,
    login: user.login,
    permissions,
  })
  const refreshToken = generateRefreshToken({
    id: user.id,
    login: user.login,
    permissions,
  })

  const settings = await SettingsRepo.listPublic()

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      login: user.login,
      name: user.name,
      permissions,
      settings,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  }
}

export async function refresh(payload: RefreshPayload): Promise<RefreshResponse> {
  const userData = jwt.verify(payload.refreshToken, env.jwtSecret) as TokenPayload

  const accessToken = generateAccessToken({
    id: userData.id,
    login: userData.login,
    permissions: userData.permissions,
  })

  return {
    accessToken,
    permissions: userData.permissions ?? [],
  }
}
