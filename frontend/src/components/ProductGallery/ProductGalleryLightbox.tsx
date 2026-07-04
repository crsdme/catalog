import type { CatalogPhotoDTO, MarkerDTO } from '@catalog/shared'
import { Check, Eraser, Loader2, X, ZoomIn, ZoomOut } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getPhotoImageUrl } from '@/api/requests/catalog'
import { PhotoMarkerLayer } from '@/components/PhotoMarkerLayer'
import { Button, Dialog, DialogContent } from '@/components/ui'
import { formatPhotoName } from '@/utils/helpers/formatPhotoName'
import { cn } from '@/utils/lib/utils'
import { isNearMarker, type ImageTransform } from '@/utils/hooks/useImageFit/useImageFit'

interface ProductGalleryLightboxProps {
  photo: CatalogPhotoDTO
  markers: MarkerDTO[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onMarkersChange: (markers: MarkerDTO[]) => void
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
}

const MIN_SCALE = 1
const MAX_SCALE = 4
const TOOLBAR_HEIGHT = 72

export function ProductGalleryLightbox({
  photo,
  markers,
  open,
  onOpenChange,
  onMarkersChange,
  saveStatus = 'idle',
}: ProductGalleryLightboxProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [transform, setTransform] = useState<ImageTransform>({ scale: 1, translateX: 0, translateY: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, translateX: 0, translateY: 0 })
  const dragMovedRef = useRef(false)

  useEffect(() => {
    if (!open)
      return

    setTransform({ scale: 1, translateX: 0, translateY: 0 })
    setIsImageLoaded(false)
  }, [open, photo.id])

  const clampTransform = useCallback((next: ImageTransform): ImageTransform => {
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next.scale))
    if (scale === 1)
      return { scale: 1, translateX: 0, translateY: 0 }
    return { ...next, scale }
  }, [])

  const handleZoomIn = () => {
    setTransform(prev => clampTransform({ ...prev, scale: prev.scale + 0.25 }))
  }

  const handleZoomOut = () => {
    setTransform(prev => clampTransform({ ...prev, scale: prev.scale - 0.25 }))
  }

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault()
    const delta = event.deltaY > 0 ? -0.12 : 0.12
    setTransform(prev => clampTransform({ ...prev, scale: prev.scale + delta }))
  }

  const handlePointerDown = (event: React.PointerEvent) => {
    if (transform.scale <= 1)
      return
    dragMovedRef.current = false
    setIsDragging(true)
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      translateX: transform.translateX,
      translateY: transform.translateY,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!isDragging)
      return
    const dx = event.clientX - dragStart.current.x
    const dy = event.clientY - dragStart.current.y
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4)
      dragMovedRef.current = true
    setTransform(prev => ({
      ...prev,
      translateX: dragStart.current.translateX + dx,
      translateY: dragStart.current.translateY + dy,
    }))
  }

  const handlePointerUp = (event: React.PointerEvent) => {
    if (!isDragging)
      return
    setIsDragging(false)
    event.currentTarget.releasePointerCapture(event.pointerId)
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
              className="size-8 rounded-full text-white/90 hover:bg-white/10 hover:text-white"
              onClick={handleZoomOut}
            >
              <ZoomOut className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-full text-white/90 hover:bg-white/10 hover:text-white"
              onClick={handleZoomIn}
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

        <div
          className={cn(
            'relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-6 touch-none',
            transform.scale > 1 ? 'cursor-grab' : 'cursor-crosshair',
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
                src={getPhotoImageUrl(photo.driveFileId, 'lightbox')}
                alt={formatPhotoName(photo.name)}
                draggable={false}
                decoding="async"
                fetchPriority="high"
                className="block max-h-[calc(100svh-6rem)] w-auto max-w-[min(92vw,1400px)] select-none rounded-lg object-contain ring-1 ring-white/10"
                onLoad={() => setIsImageLoaded(true)}
              />

              <div
                className="absolute inset-0 rounded-lg"
                onClick={handleOverlayClick}
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
