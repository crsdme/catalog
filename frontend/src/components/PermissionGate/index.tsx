import { useAuthContext } from '@/contexts'
import { hasPermission } from '@/utils/helpers/permission'

interface PermissionGateProps {
  permission: string | string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { permissions } = useAuthContext()

  const allowed = hasPermission(permissions, permission)
  return <>{allowed ? children : fallback}</>
}
