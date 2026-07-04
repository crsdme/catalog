import { useQuery } from '@tanstack/react-query'
import { postRefreshToken } from '@/api/requests'

export function useRefreshToken(settings?: {
  options?: {
    enabled?: boolean
    refetchOnWindowFocus?: boolean
    retry?: number
  }
}) {
  return useQuery({
    queryKey: ['refreshToken'],
    queryFn: postRefreshToken,
    ...settings?.options,
  })
}
