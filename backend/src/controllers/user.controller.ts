import type { NextFunction, Response } from 'express'
import type { CreateUserRequest, EditUserRequest, GetUserRequest, RemoveUserRequest } from '@catalog/shared'
import type { ValidatedRequest } from '@/types'
import * as UserService from '@/services/user.service'

export async function get(req: ValidatedRequest<GetUserRequest>, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await UserService.get(req.validated?.query ?? {} as GetUserRequest)
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(req: ValidatedRequest<unknown, CreateUserRequest>, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await UserService.create(req.validated!.body, req.user)
    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(req: ValidatedRequest<unknown, EditUserRequest>, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await UserService.edit(req.validated!.body, req.user)
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(req: ValidatedRequest<unknown, RemoveUserRequest>, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await UserService.remove(req.validated!.body, req.user)
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
