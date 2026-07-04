import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UpsertSelectionRequest } from '@catalog/shared'
import { getPublicCatalog, getPublicLink, upsertSelection } from '@/api/requests/catalog'

export function useCatalogQuery(slug: string, client: string, enabled = true) {
  return useQuery({
    queryKey: ['catalog', slug, client],
    queryFn: () => getPublicCatalog(slug, client),
    enabled: enabled && Boolean(slug && client),
    select: res => res.data.data,
  })
}

export function useCatalogByTokenQuery(token: string, enabled = true) {
  return useQuery({
    queryKey: ['catalog-link', token],
    queryFn: () => getPublicLink(token),
    enabled: enabled && Boolean(token),
    select: res => res.data.data,
  })
}

export function useSaveSelectionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpsertSelectionRequest) => upsertSelection(payload),
    onSuccess: (_res, variables) => {
      if (variables.token) {
        queryClient.invalidateQueries({ queryKey: ['catalog-link', variables.token] })
      }
      else if (variables.slug && variables.clientName) {
        queryClient.invalidateQueries({ queryKey: ['catalog', variables.slug, variables.clientName] })
      }
    },
  })
}
