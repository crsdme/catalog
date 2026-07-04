import type { CreateUserRoleRequest, EditUserRoleRequest, RemoveUserRoleRequest } from '@catalog/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUserRole, editUserRole, removeUserRole } from '@/api/requests'

export function useUserRoleCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserRoleRequest) => createUserRole(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-roles'] }),
  })
}

export function useUserRoleEdit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: EditUserRoleRequest) => editUserRole(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-roles'] }),
  })
}

export function useUserRoleRemove() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RemoveUserRoleRequest) => removeUserRole(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-roles'] }),
  })
}

export { useUserRoleOptions, useUserRoleQuery } from './useUserRoleQuery'
