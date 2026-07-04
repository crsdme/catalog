import { useMemo } from 'react'

export function useImageFit(
  naturalWidth: number,
  naturalHeight: number,
  maxWidth: number,
  maxHeight: number,
) {
  return useMemo(() => {
    if (!naturalWidth || !naturalHeight)
      return { width: 0, height: 0 }

    const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1)
    return {
      width: Math.round(naturalWidth * scale),
      height: Math.round(naturalHeight * scale),
    }
  }, [naturalWidth, naturalHeight, maxWidth, maxHeight])
}

export function isNearMarker(
  point: { x: number, y: number },
  marker: { x: number, y: number },
  threshold = 0.035,
) {
  const dx = point.x - marker.x
  const dy = point.y - marker.y
  return Math.sqrt(dx * dx + dy * dy) <= threshold
}

export interface ImageTransform {
  scale: number
  translateX: number
  translateY: number
}
