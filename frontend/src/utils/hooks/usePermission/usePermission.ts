import { useAuthContext } from '@/contexts/AuthContext'
import { hasPermission } from '@/utils/helpers/permission'

export function usePermission(required: string | string[]) {
  const { permissions } = useAuthContext()
  return hasPermission(permissions, required)
}
