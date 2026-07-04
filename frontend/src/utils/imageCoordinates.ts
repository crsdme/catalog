export interface ImageTransform {
  scale: number
  translateX: number
  translateY: number
}

export interface NormalizedPoint {
  x: number
  y: number
}

export function getDisplayedImageSize(
  containerWidth: number,
  containerHeight: number,
  naturalWidth: number,
  naturalHeight: number,
) {
  const imageAspect = naturalWidth / naturalHeight
  const containerAspect = containerWidth / containerHeight

  if (imageAspect > containerAspect) {
    const width = containerWidth
    return { width, height: containerWidth / imageAspect }
  }

  const height = containerHeight
  return { width: containerHeight * imageAspect, height }
}

export function getObjectCoverLayout(
  containerWidth: number,
  containerHeight: number,
  naturalWidth: number,
  naturalHeight: number,
) {
  const scale = Math.max(containerWidth / naturalWidth, containerHeight / naturalHeight)
  const displayWidth = naturalWidth * scale
  const displayHeight = naturalHeight * scale
  const offsetX = (containerWidth - displayWidth) / 2
  const offsetY = (containerHeight - displayHeight) / 2

  return { displayWidth, displayHeight, offsetX, offsetY, containerWidth, containerHeight }
}

export function mapMarkerForObjectCover(
  marker: NormalizedPoint,
  containerWidth: number,
  containerHeight: number,
  naturalWidth: number,
  naturalHeight: number,
): NormalizedPoint & { visible: boolean } {
  if (!naturalWidth || !naturalHeight) {
    return { ...marker, visible: true }
  }

  const { displayWidth, displayHeight, offsetX, offsetY } = getObjectCoverLayout(
    containerWidth,
    containerHeight,
    naturalWidth,
    naturalHeight,
  )

  const x = (marker.x * displayWidth + offsetX) / containerWidth
  const y = (marker.y * displayHeight + offsetY) / containerHeight
  const epsilon = 0.02

  return {
    x,
    y,
    visible: x >= -epsilon && x <= 1 + epsilon && y >= -epsilon && y <= 1 + epsilon,
  }
}

export function mapMarkersForObjectCover(
  markers: NormalizedPoint[],
  containerAspect: number,
  imageAspect: number,
) {
  const containerWidth = 1
  const containerHeight = 1 / containerAspect
  const naturalWidth = imageAspect
  const naturalHeight = 1

  return markers
    .map(marker => mapMarkerForObjectCover(
      marker,
      containerWidth,
      containerHeight,
      naturalWidth,
      naturalHeight,
    ))
    .filter(marker => marker.visible)
}

export function getNormalizedImagePoint(
  clientX: number,
  clientY: number,
  containerRect: DOMRect,
  naturalWidth: number,
  naturalHeight: number,
  transform: ImageTransform,
): NormalizedPoint | null {
  if (!naturalWidth || !naturalHeight)
    return null

  const centerX = containerRect.left + containerRect.width / 2
  const centerY = containerRect.top + containerRect.height / 2

  let x = clientX - centerX
  let y = clientY - centerY
  x = (x - transform.translateX) / transform.scale
  y = (y - transform.translateY) / transform.scale

  const { width: displayW, height: displayH } = getDisplayedImageSize(
    containerRect.width,
    containerRect.height,
    naturalWidth,
    naturalHeight,
  )

  const imgX = x + displayW / 2
  const imgY = y + displayH / 2

  if (imgX < 0 || imgY < 0 || imgX > displayW || imgY > displayH)
    return null

  return {
    x: imgX / displayW,
    y: imgY / displayH,
  }
}

export function isNearMarker(
  point: NormalizedPoint,
  marker: NormalizedPoint,
  threshold = 0.03,
) {
  const dx = point.x - marker.x
  const dy = point.y - marker.y
  return Math.sqrt(dx * dx + dy * dy) <= threshold
}
