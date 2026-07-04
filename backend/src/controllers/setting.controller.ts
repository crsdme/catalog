import type { NextFunction, Response } from 'express'
import type { CreateSettingRequest, EditSettingRequest, GetSettingsRequest } from '@catalog/shared'
import type { ValidatedRequest } from '@/types'
import * as SettingService from '@/services/setting.service'

export async function get(req: ValidatedRequest<GetSettingsRequest>, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await SettingService.get(req.validated?.query ?? {})
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(req: ValidatedRequest<unknown, CreateSettingRequest>, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await SettingService.create(req.validated!.body, req.user)
    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(req: ValidatedRequest<unknown, EditSettingRequest>, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await SettingService.edit(req.validated!.body, req.user)
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(req: ValidatedRequest<unknown, { id: string }>, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await SettingService.remove(req.validated!.body.id, req.user)
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
