import type { CatalogPhotoDTO, MarkerDTO } from '@catalog/shared'
import { useMemo } from 'react'
import { ProductGalleryTile } from '@/components/ProductGallery/ProductGalleryTile'
import { Skeleton } from '@/components/ui'

interface ProductGalleryGridProps {
  photos: CatalogPhotoDTO[]
  selections: Array<{ photoId: string, markers: MarkerDTO[] }>
  isLoading?: boolean
  onPhotoClick: (photo: CatalogPhotoDTO) => void
}

function groupPhotos(photos: CatalogPhotoDTO[]) {
  const groups = new Map<string, CatalogPhotoDTO[]>()
  for (const photo of photos) {
    const key = photo.categoryPath || '—'
    const list = groups.get(key) ?? []
    list.push(photo)
    groups.set(key, list)
  }
  return [...groups.entries()]
}

export function ProductGalleryGrid({
  photos,
  selections,
  isLoading,
  onPhotoClick,
}: ProductGalleryGridProps) {
  const markersByPhoto = useMemo(
    () => new Map(selections.map(selection => [selection.photoId, selection.markers])),
    [selections],
  )

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-wrap justify-center gap-3">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[4/5] w-[calc(50%-0.375rem)] rounded-xl bg-white/5 sm:w-44 md:w-48 lg:w-52" />
        ))}
      </div>
    )
  }

  if (!photos.length) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        —
      </div>
    )
  }

  const grouped = groupPhotos(photos)

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {grouped.map(([categoryPath, categoryPhotos]) => (
        <section key={categoryPath} className="space-y-3">
          <div className="sticky top-0 z-10 border-b border-white/5 bg-background/80 py-2 backdrop-blur-md">
            <h2 className="text-center text-sm font-medium tracking-[0.2em] text-white/50 uppercase">
              {categoryPath}
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categoryPhotos.map((photo) => (
              <ProductGalleryTile
                key={photo.id}
                photo={photo}
                markers={markersByPhoto.get(photo.id) ?? []}
                onClick={() => onPhotoClick(photo)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
