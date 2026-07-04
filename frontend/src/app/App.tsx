import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import { LogoIcon } from '@/components/ui'
import { useAuthContext } from '@/contexts'
import { ADMIN_BASE_PATH, ADMIN_LOGIN_PATH } from '@/utils/constants'
import { usePermission } from '@/utils/hooks/usePermission/usePermission'
import * as Pages from '../containers'
import '@/app/App.css'

export function ProtectedRoute({ children, permissions }: { children: React.ReactNode, permissions: string[] }) {
  const hasAccess = usePermission(permissions)
  if (!hasAccess)
    return <Pages.ErrorPage status={403} />
  return children
}

export default function App() {
  const authContext = useAuthContext()

  if (!authContext.state.isAuthChecked) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex items-center justify-center w-full max-w-sm gap-3">
          <LogoIcon className="size-10" />
          <p className="font-medium text-2xl">Catalog</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Pages.HomePage />} />
        <Route path="/catalog/:slug" element={<Pages.CatalogPage mode="slug" />} />
        <Route path="/c/:token" element={<Pages.CatalogPage mode="token" />} />

        <Route
          path={ADMIN_LOGIN_PATH}
          element={authContext.state.isAuthenticated ? <Navigate to={ADMIN_BASE_PATH} replace /> : <Pages.LoginPage />}
        />

        <Route
          path={ADMIN_BASE_PATH}
          element={authContext.state.isAuthenticated ? <Layout /> : <Navigate to={ADMIN_LOGIN_PATH} replace />}
        >
          <Route index element={<Pages.DashboardPage />} />
          <Route path="users" element={<ProtectedRoute permissions={['user.page']}><Pages.UsersPage /></ProtectedRoute>} />
          <Route path="users/roles" element={<ProtectedRoute permissions={['userRole.page']}><Pages.UserRolesPage /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute permissions={['settings.page']}><Pages.SettingsPage /></ProtectedRoute>} />
          <Route path="settings/telegram-users" element={<ProtectedRoute permissions={['settings.page']}><Pages.TelegramUsersPage /></ProtectedRoute>} />
          <Route path="settings/audit-logs" element={<ProtectedRoute permissions={['auditLog.page']}><Pages.AuditLogsPage /></ProtectedRoute>} />
          <Route path="*" element={<Pages.ErrorPage status={404} />} />
        </Route>

        <Route path="/login" element={<Navigate to={ADMIN_LOGIN_PATH} replace />} />
        <Route path="*" element={<Pages.ErrorPage status={404} backTo="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

