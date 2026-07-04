import type { NextFunction, Request, RequestHandler, Response } from 'express'
import type { z, ZodTypeAny } from 'zod'
import type { ValidatedRequest } from '@/types'

export function validateBodyRequest<TSchema extends ZodTypeAny>(
  schema: TSchema,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      res.status(400).json({ error: 'Invalid body data', details: result.error.format() })
      return
    }

    const typedReq = req as unknown as ValidatedRequest<unknown, z.output<TSchema>>

    req.body = result.data as z.output<TSchema>
    typedReq.validated = {
      query: typedReq.validated?.query ?? req.query,
      body: result.data as z.output<TSchema>,
      params: typedReq.validated?.params ?? req.params,
    }
    next()
  }
}

export function validateQueryRequest<TSchema extends ZodTypeAny>(
  schema: TSchema,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)

    if (!result.success) {
      res.status(400).json({ error: 'Invalid query data', details: result.error.format() })
      return
    }

    const typedReq = req as unknown as ValidatedRequest<z.output<TSchema>>

    typedReq.validated = {
      query: result.data as z.output<TSchema>,
      body: typedReq.validated?.body ?? req.body,
      params: typedReq.validated?.params ?? req.params,
    }
    next()
  }
}
