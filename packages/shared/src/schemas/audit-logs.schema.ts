import { z } from 'zod'
import { dateRangeSchema, idSchema, paginationSchema, responseListSchema, sorterParamsSchema } from './common'

export const auditLogChangeSchema = z.object({
  path: z.string(),
  before: z.unknown(),
  after: z.unknown(),
})

export type AuditLogChange = z.output<typeof auditLogChangeSchema>

export const auditLogPopulatedSchema = z.object({
  id: idSchema,
  resourceType: z.string(),
  resourceId: z.string(),
  resource: z.unknown().optional(),
  action: z.string(),
  changes: z.array(auditLogChangeSchema),
  comment: z.string(),
  createdBy: z.object({
    id: idSchema,
    name: z.string().trim(),
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type AuditLogPopulatedDTO = z.output<typeof auditLogPopulatedSchema>

export const getAuditLogsSchema = z.object({
  filters: z.object({
    resourceType: z.array(z.string().trim()).optional(),
    resourceId: z.array(z.string().trim()).optional(),
    action: z.array(z.string().trim()).optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    resourceType: sorterParamsSchema.optional(),
    resourceId: sorterParamsSchema.optional(),
    action: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetAuditLogsRequest = z.input<typeof getAuditLogsSchema>

export const getAuditLogsResponseSchema = responseListSchema(auditLogPopulatedSchema)
export type GetAuditLogsResponse = z.output<typeof getAuditLogsResponseSchema>
