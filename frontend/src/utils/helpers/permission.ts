export function hasPermission(permissions: string[] = [], required: string | string[]) {
  if (permissions.includes('other.admin'))
    return true

  if (Array.isArray(required))
    return required.some(permission => permissions.includes(permission))

  return permissions.includes(required)
}
