import type { CatalogPhotoDTO, MarkerDTO } from '@catalog/shared'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useCatalogByTokenQuery, useCatalogQuery, useSaveSelectionMutation } from '@/api/hooks/catalog'
import { ProductGalleryGrid, ProductGalleryLightbox } from '@/components/ProductGallery'

type CatalogPageMode = 'slug' | 'token'

interface CatalogPageProps {
  mode: CatalogPageMode
}

export function CatalogPage({ mode }: CatalogPageProps) {
  const { slug, token } = useParams()
  const [searchParams] = useSearchParams()
  const client = searchParams.get('client')?.trim() ?? ''

  const slugQuery = useCatalogQuery(slug ?? '', client, mode === 'slug')
  const tokenQuery = useCatalogByTokenQuery(token ?? '', mode === 'token')

  const catalogData = mode === 'slug' ? slugQuery.data : tokenQuery.data
  const isLoading = mode === 'slug' ? slugQuery.isLoading : tokenQuery.isLoading
  const isError = mode === 'slug' ? slugQuery.isError : tokenQuery.isError
  const error = mode === 'slug' ? slugQuery.error : tokenQuery.error

  const saveMutation = useSaveSelectionMutation()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxPhoto, setLightboxPhoto] = useState<CatalogPhotoDTO | null>(null)
  const [localMarkers, setLocalMarkers] = useState<MarkerDTO[]>([])
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const saveTimerRef = useRef<number | null>(null)
  const closeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    document.documentElement.classList.add('dark')
    return () => {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const selectionsMap = useMemo(() => {
    const map = new Map<string, MarkerDTO[]>()
    for (const selection of catalogData?.selections ?? []) {
      map.set(selection.photoId, selection.markers)
    }
    return map
  }, [catalogData?.selections])

  const openPhoto = (photo: CatalogPhotoDTO) => {
    if (closeTimerRef.current)
      window.clearTimeout(closeTimerRef.current)
    setLightboxPhoto(photo)
    setLightboxOpen(true)
    setLocalMarkers(selectionsMap.get(photo.id) ?? [])
    setSaveStatus('idle')
  }

  const handleLightboxOpenChange = (open: boolean) => {
    setLightboxOpen(open)
    if (!open) {
      closeTimerRef.current = window.setTimeout(() => {
        setLightboxPhoto(null)
        setLocalMarkers([])
        setSaveStatus('idle')
      }, 300)
    }
  }

  const persistMarkers = useCallback((markers: MarkerDTO[]) => {
    if (!lightboxPhoto || !catalogData)
      return

    setSaveStatus('saving')

    const payload = mode === 'token' && token
      ? { token, photoId: lightboxPhoto.id, markers }
      : {
          slug: catalogData.catalog.slug,
          clientName: catalogData.clientName,
          photoId: lightboxPhoto.id,
          markers,
        }

    saveMutation.mutate(payload, {
      onSuccess: () => setSaveStatus('saved'),
      onError: () => setSaveStatus('error'),
    })
  }, [lightboxPhoto, catalogData, mode, token, saveMutation])

  const handleMarkersChange = (markers: MarkerDTO[]) => {
    setLocalMarkers(markers)

    if (saveTimerRef.current)
      window.clearTimeout(saveTimerRef.current)

    saveTimerRef.current = window.setTimeout(() => {
      persistMarkers(markers)
    }, 500)
  }

  useEffect(() => {
    return () => {
      if (saveTimerRef.current)
        window.clearTimeout(saveTimerRef.current)
      if (closeTimerRef.current)
        window.clearTimeout(closeTimerRef.current)
    }
  }, [])

  if (mode === 'slug' && !client) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-6 text-sm text-muted-foreground">
        —
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-6 text-sm text-muted-foreground">
        {(error as Error)?.message ?? '—'}
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background">
      <main className="mx-auto w-full px-2 py-4 md:px-4">
        <ProductGalleryGrid
          photos={catalogData?.photos ?? []}
          selections={(catalogData?.selections ?? []).map(selection => ({
            photoId: selection.photoId,
            markers: selection.markers,
          }))}
          isLoading={isLoading}
          onPhotoClick={openPhoto}
        />
      </main>

      {lightboxPhoto && (
        <ProductGalleryLightbox
          photo={lightboxPhoto}
          markers={localMarkers}
          open={lightboxOpen}
          onOpenChange={handleLightboxOpenChange}
          onMarkersChange={handleMarkersChange}
          saveStatus={saveStatus}
        />
      )}
    </div>
  )
}
