import { useCallback, useRef, useState } from 'react'
import type { ImageTransform } from '@/utils/hooks/useImageFit/useImageFit'

const MIN_SCALE = 1
const MAX_SCALE = 5

interface UsePinchZoomOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  swipeThreshold?: number
}

export function usePinchZoom(options: UsePinchZoomOptions = {}) {
  const { onSwipeLeft, onSwipeRight, swipeThreshold = 60 } = options
  const [transform, setTransform] = useState<ImageTransform>({ scale: 1, translateX: 0, translateY: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const dragStart = useRef({ x: 0, y: 0, translateX: 0, translateY: 0 })
  const dragMovedRef = useRef(false)
  const pinchStart = useRef<{ distance: number, scale: number, centerX: number, centerY: number } | null>(null)
  const swipeStart = useRef<{ x: number, y: number, time: number } | null>(null)
  const activePointers = useRef(new Map<number, { x: number, y: number }>())

  const clampTransform = useCallback((next: ImageTransform): ImageTransform => {
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next.scale))
    if (scale === 1)
      return { scale: 1, translateX: 0, translateY: 0 }
    return { ...next, scale }
  }, [])

  const resetTransform = useCallback(() => {
    setTransform({ scale: 1, translateX: 0, translateY: 0 })
  }, [])

  const zoomIn = useCallback(() => {
    setTransform(prev => clampTransform({ ...prev, scale: prev.scale + 0.5 }))
  }, [clampTransform])

  const zoomOut = useCallback(() => {
    setTransform(prev => clampTransform({ ...prev, scale: prev.scale - 0.5 }))
  }, [clampTransform])

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault()
    const delta = event.deltaY > 0 ? -0.15 : 0.15
    setTransform(prev => clampTransform({ ...prev, scale: prev.scale + delta }))
  }, [clampTransform])

  const getPinchDistance = (p1: { x: number, y: number }, p2: { x: number, y: number }) => {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    event.currentTarget.setPointerCapture(event.pointerId)

    if (activePointers.current.size === 2) {
      const [p1, p2] = [...activePointers.current.values()]
      pinchStart.current = {
        distance: getPinchDistance(p1, p2),
        scale: transform.scale,
        centerX: (p1.x + p2.x) / 2,
        centerY: (p1.y + p2.y) / 2,
      }
      swipeStart.current = null
      setIsDragging(false)
      return
    }

    if (activePointers.current.size === 1) {
      if (transform.scale > 1) {
        dragMovedRef.current = false
        setIsDragging(true)
        dragStart.current = {
          x: event.clientX,
          y: event.clientY,
          translateX: transform.translateX,
          translateY: transform.translateY,
        }
      }
      else {
        swipeStart.current = { x: event.clientX, y: event.clientY, time: Date.now() }
      }
    }
  }, [transform])

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!activePointers.current.has(event.pointerId))
      return

    activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (activePointers.current.size === 2 && pinchStart.current) {
      const [p1, p2] = [...activePointers.current.values()]
      const distance = getPinchDistance(p1, p2)
      const scaleFactor = distance / pinchStart.current.distance
      const newScale = pinchStart.current.scale * scaleFactor
      setTransform(prev => clampTransform({ ...prev, scale: newScale }))
      dragMovedRef.current = true
      return
    }

    if (isDragging && activePointers.current.size === 1) {
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
  }, [isDragging, clampTransform])

  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    activePointers.current.delete(event.pointerId)
    pinchStart.current = null

    if (isDragging) {
      setIsDragging(false)
    }

    if (activePointers.current.size === 0 && swipeStart.current && transform.scale <= 1) {
      const dx = event.clientX - swipeStart.current.x
      const dy = event.clientY - swipeStart.current.y
      const elapsed = Date.now() - swipeStart.current.time

      if (Math.abs(dx) > swipeThreshold && Math.abs(dx) > Math.abs(dy) * 1.5 && elapsed < 500) {
        if (dx < 0)
          onSwipeLeft?.()
        else
          onSwipeRight?.()
        dragMovedRef.current = true
      }
      swipeStart.current = null
    }

    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    catch {
      // pointer may already be released
    }
  }, [isDragging, transform.scale, swipeThreshold, onSwipeLeft, onSwipeRight])

  const handleDoubleTap = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault()
    setTransform(prev => {
      if (prev.scale > 1)
        return { scale: 1, translateX: 0, translateY: 0 }
      return clampTransform({ ...prev, scale: 2.5 })
    })
    dragMovedRef.current = true
  }, [clampTransform])

  return {
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
    isZoomed: transform.scale > 1,
  }
}
