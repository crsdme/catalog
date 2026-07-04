import type {
  PublicCatalogResponse,
  PublicLinkResponse,
  UpsertSelectionRequest,
  UpsertSelectionResponse,
} from '@catalog/shared'
import { api } from '@/api/instance'

export type PhotoImageVariant = 'thumb' | 'lightbox' | 'full'

const VARIANT_PARAMS: Record<PhotoImageVariant, { w: number, q: number }> = {
  thumb: { w: 520, q: 92 },
  lightbox: { w: 1600, q: 90 },
  full: { w: 2560, q: 92 },
}

export async function getPublicCatalog(slug: string, client: string) {
  return api.get<PublicCatalogResponse>(`public/catalog/${slug}`, { params: { client } })
}

export async function getPublicLink(token: string) {
  return api.get<PublicLinkResponse>(`public/link/${token}`)
}

export async function upsertSelection(payload: UpsertSelectionRequest) {
  return api.put<UpsertSelectionResponse>('public/selections', payload)
}

export function getPhotoImageUrl(driveFileId: string, variant: PhotoImageVariant = 'thumb') {
  const params = VARIANT_PARAMS[variant]
  const search = new URLSearchParams({
    w: String(params.w),
    q: String(params.q),
  })
  return `/api/public/photos/${encodeURIComponent(driveFileId)}/image?${search.toString()}`
}
