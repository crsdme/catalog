import { z } from 'zod'
import { dateRangeSchema, idSchema, paginationSchema, responseItemSchema, responseListSchema, sorterParamsSchema } from './common'
import { catalogPhotoSchema, catalogSchema, markerSchema, photoSelectionSchema } from './catalog.schema'

export { markerSchema, photoSelectionSchema } from './catalog.schema'
export type { MarkerDTO, PhotoSelectionDTO } from './catalog.schema'

export const upsertSelectionSchema = z.object({
  slug: z.string().min(1).optional(),
  token: z.string().min(1).optional(),
  clientName: z.string().min(1).optional(),
  photoId: idSchema,
  markers: z.array(markerSchema),
}).refine(
  data => (data.slug && data.clientName) || data.token,
  { message: 'Either slug+clientName or token is required' },
)

export type UpsertSelectionRequest = z.input<typeof upsertSelectionSchema>

export const upsertSelectionResponseSchema = responseItemSchema(photoSelectionSchema)
export type UpsertSelectionResponse = z.output<typeof upsertSelectionResponseSchema>

export const managerSelectionSchema = z.object({
  id: idSchema,
  clientName: z.string(),
  catalog: catalogSchema,
  photo: catalogPhotoSchema,
  markers: z.array(markerSchema),
  linkToken: z.string().nullable(),
  updatedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
})

export type ManagerSelectionDTO = z.output<typeof managerSelectionSchema>

export const getSelectionSchema = z.object({
  filters: z.object({
    catalogId: idSchema.optional(),
    clientName: z.string().optional(),
    photoId: idSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).default({}),
  sorters: z.object({
    clientName: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional(),
  pagination: paginationSchema.optional().default({}),
})

export type GetSelectionRequest = z.input<typeof getSelectionSchema>

export const getSelectionsResponseSchema = responseListSchema(managerSelectionSchema)
export type GetSelectionsResponse = z.output<typeof getSelectionsResponseSchema>
