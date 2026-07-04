import type { CatalogPhotoDTO, MarkerDTO } from '@catalog/shared'
import { Check, ChevronLeft, ChevronRight, Eraser, Hand, Loader2, X, ZoomIn, ZoomOut } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getPhotoImageUrl } from '@/api/requests/catalog'
import { PhotoMarkerLayer } from '@/components/PhotoMarkerLayer'
import { Button, Dialog, DialogContent } from '@/components/ui'
import { formatPhotoName } from '@/utils/helpers/formatPhotoName'
import { cn } from '@/utils/lib/utils'
import { isNearMarker } from '@/utils/hooks/useImageFit/useImageFit'
import { usePinchZoom } from '@/utils/hooks/usePinchZoom/usePinchZoom'

interface ProductGalleryLightboxProps {
  photo: CatalogPhotoDTO
  photos: CatalogPhotoDTO[]
  photoIndex: number
  markers: MarkerDTO[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onMarkersChange: (markers: MarkerDTO[]) => void
  onNavigate: (index: number) => void
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
}

const TOOLBAR_HEIGHT = 72
const GUIDE_STORAGE_KEY = 'catalog-gallery-guide-seen'

export function ProductGalleryLightbox({
  photo,
  photos,
  photoIndex,
  markers,
  open,
  onOpenChange,
  onMarkersChange,
  onNavigate,
  saveStatus = 'idle',
}: ProductGalleryLightboxProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const lastTapRef = useRef(0)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  const hasPrev = photoIndex > 0
  const hasNext = photoIndex < photos.length - 1

  const goPrev = useCallback(() => {
    if (hasPrev)
      onNavigate(photoIndex - 1)
  }, [hasPrev, onNavigate, photoIndex])

  const goNext = useCallback(() => {
    if (hasNext)
      onNavigate(photoIndex + 1)
  }, [hasNext, onNavigate, photoIndex])

  const {
    transform,
    isDragging,
    dragMovedRef,
    resetTransform,
    zoomIn,
    zoomOut,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleDoubleTap,
    isZoomed,
  } = usePinchZoom({
    onSwipeLeft: goNext,
    onSwipeRight: goPrev,
  })

  useEffect(() => {
    if (!open)
      return

    resetTransform()
    setIsImageLoaded(false)

    try {
      setShowGuide(!localStorage.getItem(GUIDE_STORAGE_KEY))
    }
    catch {
      setShowGuide(true)
    }
  }, [open, photo.id, resetTransform])

  const dismissGuide = () => {
    setShowGuide(false)
    try {
      localStorage.setItem(GUIDE_STORAGE_KEY, '1')
    }
    catch {
      // ignore
    }
  }

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (dragMovedRef.current) {
      dragMovedRef.current = false
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height

    if (x < 0 || y < 0 || x > 1 || y > 1)
      return

    const point = { x, y }
    const existingIndex = markers.findIndex(marker => isNearMarker(point, marker))
    if (existingIndex >= 0) {
      onMarkersChange(markers.filter((_, index) => index !== existingIndex))
      return
    }

    onMarkersChange([...markers, point])
  }

  const handleTap = (event: React.MouseEvent) => {
    const now = Date.now()
    if (now - lastTapRef.current < 300) {
      handleDoubleTap(event)
      lastTapRef.current = 0
    }
    else {
      lastTapRef.current = now
    }
  }

  const imageVariant = 'full' as const

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        fullscreen
        showCloseButton={false}
        className="bg-black/90 backdrop-blur-sm data-[state=closed]:duration-300 data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center p-4">
          <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-black/55 px-2 py-1.5 shadow-2xl backdrop-blur-md">
            {saveStatus === 'saved' && (
              <span className="flex size-8 items-center justify-center text-emerald-400">
                <Check className="size-4" />
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="flex size-8 items-center justify-center text-white/70">
                <Loader2 className="size-4 animate-spin" />
              </span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!hasPrev}
              className="size-8 rounded-full text-white/90 hover:bg-white/10 hover:text-white disabled:opacity-30"
              onClick={goPrev}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[3rem] text-center text-xs text-white/60">
              {photoIndex + 1}
              /
              {photos.length}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!hasNext}
              className="size-8 rounded-full text-white/90 hover:bg-white/10 hover:text-white disabled:opacity-30"
              onClick={goNext}
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-full text-white/90 hover:bg-white/10 hover:text-white"
              onClick={zoomOut}
            >
              <ZoomOut className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-full text-white/90 hover:bg-white/10 hover:text-white"
              onClick={zoomIn}
            >
              <ZoomIn className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-full text-white/90 hover:bg-white/10 hover:text-white"
              onClick={() => onMarkersChange([])}
            >
              <Eraser className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-full text-white/90 hover:bg-white/10 hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {showGuide && (
          <div className="absolute inset-0 z-40 flex items-end justify-center bg-black/60 p-4 pb-24 sm:items-center sm:pb-4">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900/95 p-5 shadow-2xl backdrop-blur-md">
              <div className="mb-3 flex items-center gap-2 text-white">
                <Hand className="size-5 text-white/70" />
                <h3 className="text-base font-medium">Как выбрать товар</h3>
              </div>
              <ul className="space-y-2 text-sm text-white/75">
                <li>• Нажмите на фото, чтобы поставить метку на понравившийся товар</li>
                <li>• Нажмите на метку ещё раз, чтобы убрать её</li>
                <li>• Свайп влево/вправо — переключить фото</li>
                <li>• Два пальца или двойной тап — приблизить для деталей</li>
                <li>• Выбор сохраняется автоматически</li>
              </ul>
              <Button
                type="button"
                className="mt-4 w-full"
                onClick={dismissGuide}
              >
                Понятно
              </Button>
            </div>
          </div>
        )}

        <div
          className={cn(
            'relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-6 touch-none',
            isZoomed ? 'cursor-grab' : 'cursor-crosshair',
            isDragging && 'cursor-grabbing',
          )}
          style={{ paddingTop: TOOLBAR_HEIGHT }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            className="relative mx-auto flex items-center justify-center will-change-transform"
            style={{
              transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.05s ease-out',
            }}
          >
            {!isImageLoaded && (
              <div className="flex h-[min(70svh,720px)] w-[min(92vw,960px)] items-center justify-center rounded-lg bg-white/5">
                <Loader2 className="size-8 animate-spin text-white/40" />
              </div>
            )}

            <div
              className={cn(
                'relative max-w-[min(92vw,1400px)]',
                !isImageLoaded ? 'pointer-events-none absolute opacity-0' : 'inline-block',
              )}
            >
              <img
                ref={imageRef}
                key={`${photo.id}-${imageVariant}`}
                src={getPhotoImageUrl(photo.driveFileId, imageVariant)}
                alt={formatPhotoName(photo.name)}
                draggable={false}
                decoding="async"
                fetchPriority="high"
                className="block max-h-[calc(100svh-6rem)] w-auto max-w-[min(92vw,1400px)] select-none rounded-lg object-contain ring-1 ring-white/10"
                onLoad={() => setIsImageLoaded(true)}
              />

              <div
                className="absolute inset-0 rounded-lg"
                onClick={(event) => {
                  handleTap(event)
                  if (!isZoomed)
                    handleOverlayClick(event)
                }}
              >
                <PhotoMarkerLayer
                  markers={markers}
                  onMarkerClick={(index) => {
                    onMarkersChange(markers.filter((_, i) => i !== index))
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {isImageLoaded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-4 text-center">
            <p className="truncate text-sm text-white/90">{formatPhotoName(photo.name)}</p>
            {photo.categoryPath && (
              <p className="truncate text-xs text-white/50">{photo.categoryPath}</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
