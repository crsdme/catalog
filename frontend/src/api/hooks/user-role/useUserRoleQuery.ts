import type { GetUserRoleRequest } from '@catalog/shared'
import { useQuery } from '@tanstack/react-query'
import { getUserRoles } from '@/api/requests'

export function useUserRoleQuery(payload: GetUserRoleRequest) {
  return useQuery({
    queryKey: ['user-roles', payload],
    queryFn: () => getUserRoles(payload),
    select: res => ({
      roles: res.data.data.items,
      rolesCount: res.data.data.pagination.total,
    }),
  })
}

export function useUserRoleOptions() {
  return useQuery({
    queryKey: ['user-roles', 'options'],
    queryFn: () => getUserRoles({ pagination: { full: true } }),
    select: res => res.data.data.items.map(role => ({
      value: role.id,
      label: role.names.en ?? role.names.ru ?? role.id,
    })),
  })
}
