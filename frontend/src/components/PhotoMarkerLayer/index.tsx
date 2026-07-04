import type { MarkerDTO } from '@catalog/shared'
import { cn } from '@/utils/lib/utils'

interface PhotoMarkerLayerProps {
  markers: MarkerDTO[]
  className?: string
  size?: 'sm' | 'md'
  onMarkerClick?: (index: number) => void
}

export function PhotoMarkerLayer({
  markers,
  className,
  size = 'md',
  onMarkerClick,
}: PhotoMarkerLayerProps) {
  const dotSize = size === 'sm' ? 'size-2' : 'size-3.5'
  const ringSize = size === 'sm' ? 'ring-1' : 'ring-2'

  return (
    <div className={cn('pointer-events-none absolute inset-0', className)}>
      {markers.map((marker, index) => (
        <button
          key={`${marker.x}-${marker.y}-${index}`}
          type="button"
          aria-label="Marker"
          className={cn(
            'pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full',
            'bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.35)] backdrop-blur-[1px]',
            ringSize,
            'ring-white/80 transition-transform hover:scale-125',
            dotSize,
            !onMarkerClick && 'pointer-events-none',
          )}
          style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%` }}
          onClick={(event) => {
            event.stopPropagation()
            onMarkerClick?.(index)
          }}
        />
      ))}
    </div>
  )
}
