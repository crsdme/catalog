export const backendUrl = import.meta.env.VITE_BACKEND_URL ?? ''

export const apiBaseUrl = backendUrl
  ? `${String(backendUrl).replace(/\/$/, '')}/api/`
  : '/api/'

export const ADMIN_BASE_PATH = '/admin'
export const ADMIN_LOGIN_PATH = `${ADMIN_BASE_PATH}/login`

export const SUPPORTED_LANGUAGES = ['ru', 'en'] as const
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

export const NAV_MENU_ITEMS = [
  {
    id: 'dashboard',
    url: ADMIN_BASE_PATH,
    icon: 'LayoutDashboard',
    permissions: ['dashboard.page'],
  },
  {
    id: 'users',
    icon: 'Users',
    permissions: ['user.page', 'userRole.page'],
    items: [
      { id: 'users', url: `${ADMIN_BASE_PATH}/users`, permissions: ['user.page'] },
      { id: 'userRoles', url: `${ADMIN_BASE_PATH}/users/roles`, permissions: ['userRole.page'] },
    ],
  },
  {
    id: 'settings',
    icon: 'Settings',
    permissions: ['settings.page', 'auditLog.page'],
    items: [
      { id: 'settings', url: `${ADMIN_BASE_PATH}/settings`, permissions: ['settings.page'] },
      { id: 'telegramUsers', url: `${ADMIN_BASE_PATH}/settings/telegram-users`, permissions: ['settings.page'] },
      { id: 'auditLogs', url: `${ADMIN_BASE_PATH}/settings/audit-logs`, permissions: ['auditLog.page'] },
    ],
  },
]

export const USER_ROLE_PERMISSIONS = [
  { group: 'dashboard', permissions: ['dashboard.page'] },
  { group: 'users', permissions: ['user.page', 'user.read', 'user.create', 'user.edit', 'user.remove'] },
  { group: 'userRoles', permissions: ['userRole.page', 'userRole.read', 'userRole.create', 'userRole.edit', 'userRole.remove'] },
  { group: 'settings', permissions: ['settings.page', 'settings.read', 'settings.create', 'settings.edit', 'settings.remove'] },
  { group: 'auditLogs', permissions: ['auditLog.page', 'auditLog.read'] },
  { group: 'storage', permissions: ['storage.upload'] },
  { group: 'catalog', permissions: ['catalog.link.create', 'catalog.link.read', 'selection.view'] },
  { group: 'other', permissions: ['other.admin'] },
] as const
