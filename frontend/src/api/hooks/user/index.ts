import type { CreateUserRequest, EditUserRequest, RemoveUserRequest } from '@catalog/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUser, editUser, removeUser } from '@/api/requests'

export function useUserCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserRequest) => createUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useUserEdit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: EditUserRequest) => editUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useUserRemove() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RemoveUserRequest) => removeUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export { useUserQuery } from './useUserQuery'
