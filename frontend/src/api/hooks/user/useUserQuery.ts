import type { GetUserRequest } from '@catalog/shared'
import { useQuery } from '@tanstack/react-query'
import { getUsers } from '@/api/requests'

export function useUserQuery(payload: GetUserRequest) {
  return useQuery({
    queryKey: ['users', payload],
    queryFn: () => getUsers(payload),
    select: res => ({
      users: res.data.data.items,
      usersCount: res.data.data.pagination.total,
    }),
  })
}
