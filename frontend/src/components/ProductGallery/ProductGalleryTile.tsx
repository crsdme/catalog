import type { CatalogPhotoDTO, MarkerDTO } from '@catalog/shared'
import { useMemo, useState } from 'react'
import { getPhotoImageUrl } from '@/api/requests/catalog'
import { PhotoMarkerLayer } from '@/components/PhotoMarkerLayer'
import { formatPhotoName } from '@/utils/helpers/formatPhotoName'
import { mapMarkersForObjectCover } from '@/utils/imageCoordinates'
import { cn } from '@/utils/lib/utils'

const THUMB_ASPECT = 4 / 5

interface ProductGalleryTileProps {
  photo: CatalogPhotoDTO
  markers: MarkerDTO[]
  onClick: () => void
}

export function ProductGalleryTile({ photo, markers, onClick }: ProductGalleryTileProps) {
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 })

  const displayMarkers = useMemo(() => {
    if (!naturalSize.width || !naturalSize.height)
      return markers

    const imageAspect = naturalSize.width / naturalSize.height
    return mapMarkersForObjectCover(markers, THUMB_ASPECT, imageAspect)
  }, [markers, naturalSize])

  return (
    <button
      type="button"
      className={cn(
        'group relative w-[calc(50%-0.375rem)] overflow-hidden rounded-xl text-left sm:w-44 md:w-48 lg:w-52',
        'border border-white/5 bg-zinc-950/40',
        'transition-all duration-300 hover:border-white/15 hover:bg-zinc-900/60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
      )}
      onClick={onClick}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <img
          src={getPhotoImageUrl(photo.driveFileId, 'thumb')}
          alt={formatPhotoName(photo.name)}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
          onLoad={(event) => {
            setNaturalSize({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight,
            })
          }}
        />
        {displayMarkers.length > 0 && (
          <PhotoMarkerLayer markers={displayMarkers} size="sm" />
        )}
      </div>
      <p className="truncate px-2 py-2 text-xs text-white/70">{formatPhotoName(photo.name)}</p>
    </button>
  )
}
