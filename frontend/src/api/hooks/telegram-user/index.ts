import type {
  CreateTelegramAllowedUserRequest,
  EditTelegramAllowedUserRequest,
  GetTelegramAllowedUserRequest,
  RemoveTelegramAllowedUserRequest,
} from '@catalog/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTelegramUser, editTelegramUser, getTelegramUsers, removeTelegramUsers } from '@/api/requests/telegram-users'

export function useTelegramUserQuery(payload: GetTelegramAllowedUserRequest) {
  return useQuery({
    queryKey: ['telegram-users', payload],
    queryFn: () => getTelegramUsers(payload),
    select: res => ({
      users: res.data.data.items,
      usersCount: res.data.data.pagination.total,
    }),
  })
}

export function useTelegramUserCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTelegramAllowedUserRequest) => createTelegramUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['telegram-users'] }),
  })
}

export function useTelegramUserEdit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: EditTelegramAllowedUserRequest) => editTelegramUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['telegram-users'] }),
  })
}

export function useTelegramUserRemove() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RemoveTelegramAllowedUserRequest) => removeTelegramUsers(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['telegram-users'] }),
  })
}
