import type { NextFunction, Response } from 'express'
import type {
  CreateTelegramAllowedUserRequest,
  EditTelegramAllowedUserRequest,
  GetTelegramAllowedUserRequest,
  RemoveTelegramAllowedUserRequest,
} from '@catalog/shared'
import type { ValidatedRequest } from '@/types'
import * as TelegramUserService from '@/services/telegram-user.service'

export async function get(req: ValidatedRequest<GetTelegramAllowedUserRequest>, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await TelegramUserService.get(req.validated?.query ?? {} as GetTelegramAllowedUserRequest)
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<unknown, CreateTelegramAllowedUserRequest>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await TelegramUserService.create(req.validated!.body, req.user)
    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<unknown, EditTelegramAllowedUserRequest>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await TelegramUserService.edit(req.validated!.body, req.user)
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<unknown, RemoveTelegramAllowedUserRequest>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await TelegramUserService.remove(req.validated!.body.ids, req.user)
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
