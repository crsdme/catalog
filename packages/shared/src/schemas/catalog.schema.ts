import { z } from 'zod'
import { dateRangeSchema, idSchema, paginationSchema, responseItemSchema, responseListSchema, sorterParamsSchema } from './common'

export const markerSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
})

export type MarkerDTO = z.output<typeof markerSchema>

export const catalogCategorySchema = z.object({
  id: idSchema,
  name: z.string(),
  path: z.string(),
  depth: z.number(),
})

export type CatalogCategoryDTO = z.output<typeof catalogCategorySchema>

export const catalogPhotoSchema = z.object({
  id: idSchema,
  driveFileId: z.string(),
  name: z.string(),
  sortOrder: z.number(),
  categoryId: idSchema.nullable(),
  categoryPath: z.string(),
})

export type CatalogPhotoDTO = z.output<typeof catalogPhotoSchema>

export const catalogSchema = z.object({
  id: idSchema,
  slug: z.string(),
  title: z.string(),
  active: z.boolean(),
})

export type CatalogDTO = z.output<typeof catalogSchema>

export const photoSelectionSchema = z.object({
  photoId: idSchema,
  markers: z.array(markerSchema),
  updatedAt: z.coerce.date(),
})

export type PhotoSelectionDTO = z.output<typeof photoSelectionSchema>

export const publicCatalogQuerySchema = z.object({
  client: z.string().min(1),
})

export type PublicCatalogQuery = z.input<typeof publicCatalogQuerySchema>

export const publicCatalogDataSchema = z.object({
  catalog: catalogSchema,
  categories: z.array(catalogCategorySchema),
  photos: z.array(catalogPhotoSchema),
  selections: z.array(photoSelectionSchema),
  clientName: z.string(),
})

export type PublicCatalogData = z.output<typeof publicCatalogDataSchema>

export const publicCatalogResponseSchema = responseItemSchema(publicCatalogDataSchema)
export type PublicCatalogResponse = z.output<typeof publicCatalogResponseSchema>

export const publicLinkDataSchema = publicCatalogDataSchema.extend({
  token: z.string(),
  label: z.string(),
})

export type PublicLinkData = z.output<typeof publicLinkDataSchema>

export const publicLinkResponseSchema = responseItemSchema(publicLinkDataSchema)
export type PublicLinkResponse = z.output<typeof publicLinkResponseSchema>

export const createCatalogLinkSchema = z.object({
  catalogId: idSchema,
  clientName: z.string().min(1),
  label: z.string().optional(),
  categoryIds: z.array(idSchema).default([]),
  managerTelegramId: z.string().optional(),
  expiresAt: z.coerce.date().optional(),
})

export type CreateCatalogLinkRequest = z.input<typeof createCatalogLinkSchema>

export const updateCatalogLinkSchema = z.object({
  id: idSchema,
  clientName: z.string().min(1).optional(),
  label: z.string().optional(),
  categoryIds: z.array(idSchema).optional(),
})

export type UpdateCatalogLinkRequest = z.input<typeof updateCatalogLinkSchema>

export const catalogLinkSchema = z.object({
  id: idSchema,
  token: z.string(),
  catalogId: idSchema,
  clientName: z.string(),
  label: z.string(),
  categoryIds: z.array(idSchema),
  managerTelegramId: z.string().nullable(),
  expiresAt: z.coerce.date().nullable(),
  url: z.string(),
  createdAt: z.coerce.date(),
})

export type CatalogLinkDTO = z.output<typeof catalogLinkSchema>

export const createCatalogLinkResponseSchema = responseItemSchema(catalogLinkSchema)
export type CreateCatalogLinkResponse = z.output<typeof createCatalogLinkResponseSchema>

export const updateCatalogLinkResponseSchema = responseItemSchema(catalogLinkSchema)
export type UpdateCatalogLinkResponse = z.output<typeof updateCatalogLinkResponseSchema>

export const getCatalogLinkSchema = z.object({
  filters: z.object({
    catalogId: idSchema.optional(),
    clientName: z.string().optional(),
    managerTelegramId: z.string().optional(),
    createdAt: dateRangeSchema.optional(),
  }).default({}),
  sorters: z.object({
    clientName: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional(),
  pagination: paginationSchema.optional().default({}),
})

export type GetCatalogLinkRequest = z.input<typeof getCatalogLinkSchema>

export const getCatalogLinksResponseSchema = responseListSchema(catalogLinkSchema.omit({ url: true }))
export type GetCatalogLinksResponse = z.output<typeof getCatalogLinksResponseSchema>

export const linkSelectionSummarySchema = z.object({
  photoId: idSchema,
  photoName: z.string(),
  categoryPath: z.string(),
  markers: z.array(markerSchema),
  updatedAt: z.coerce.date(),
})

export type LinkSelectionSummaryDTO = z.output<typeof linkSelectionSummarySchema>
