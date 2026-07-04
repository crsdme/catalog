import { z } from 'zod'
import { paginationResponseSchema } from './pagination.schema'

export const successResponseSchema = z.object({
  status: z.literal('success'),
  code: z.string(),
  message: z.string().optional(),
}).strict()

export const errorResponseSchema = z.object({
  status: z.literal('error'),
  code: z.string(),
  message: z.string().optional(),
}).strict()

export function responseItemSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return successResponseSchema.extend({
    data: itemSchema,
  }).strict()
}

export function responseItemsSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return successResponseSchema.extend({
    data: z.object({
      items: z.array(itemSchema),
    }).strict(),
  }).strict()
}

export function responseListSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return successResponseSchema.extend({
    data: z.object({
      items: z.array(itemSchema),
      pagination: paginationResponseSchema,
    }).strict(),
  }).strict()
}

export const responseSchema = successResponseSchema
