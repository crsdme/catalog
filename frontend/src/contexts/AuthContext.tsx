import type { AuthUserDTO, LoginRequest, LoginResponse } from '@catalog/shared'
import type { Dispatch, ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthLogin, useAuthLogout, useRefreshToken } from '@/api/hooks'
import { setupAxiosInterceptors } from '@/api/instance'
import { useAppSettingsContext } from '@/contexts/AppSettingsContext'

interface AuthState {
  isAuthenticated: boolean
  isAuthChecked: boolean
}

interface AuthContextType {
  state: AuthState
  user: AuthUserDTO | null
  permissions: string[]
  dispatch: Dispatch<{ type: 'LOGIN' | 'REFRESH' | 'LOGOUT' }>
  login: (credentials: LoginRequest) => void
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const LOCAL_STORAGE_KEY = 'profile'

function authReducer(state: AuthState, action: { type: 'LOGIN' | 'REFRESH' | 'LOGOUT' }) {
  switch (action.type) {
    case 'LOGIN':
    case 'REFRESH':
      return { isAuthenticated: true, isAuthChecked: true }
    case 'LOGOUT':
      return { isAuthenticated: false, isAuthChecked: true }
    default:
      return state
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    isAuthChecked: false,
  })
  const [permissions, setPermissions] = useState<string[]>([])
  const [user, setUser] = useState<AuthUserDTO | null>(null)
  const { t } = useTranslation()
  const { setSettings } = useAppSettingsContext()

  const refreshQuery = useRefreshToken({
    options: {
      refetchOnWindowFocus: false,
      enabled: false,
      retry: 0,
    },
  })

  const loginMutation = useAuthLogin({
    options: {
      onSuccess: ({ data }) => {
        const loggedInUser = data.user as LoginResponse['user']
        setUser(loggedInUser)
        setPermissions(loggedInUser.permissions)
        setSettings(loggedInUser.settings ?? [])
        dispatch({ type: 'LOGIN' })
      },
      onError: ({ response }) => {
        const error = response?.data?.error
        if (error) {
          toast.error(t(`error.title.${error.code}`), {
            description: `${t(`error.description.${error.code}`)} ${error.description ?? ''}`,
          })
        }
      },
    },
  })

  const logoutMutation = useAuthLogout({
    options: {
      onSuccess: () => {
        setUser(null)
        setPermissions([])
        setSettings([])
        localStorage.removeItem(LOCAL_STORAGE_KEY)
        dispatch({ type: 'LOGOUT' })
      },
    },
  })

  const login = (value: LoginRequest) => {
    loginMutation.mutate(value)
  }

  const refresh = async (): Promise<void> => {
    return refreshQuery
      .refetch()
      .then(({ status, data }) => {
        if (status === 'success') {
          setPermissions(data.data.permissions)
          dispatch({ type: 'REFRESH' })
          return
        }
        dispatch({ type: 'LOGOUT' })
        return Promise.reject(new Error('Token refresh failed'))
      })
  }

  const logout = () => {
    logoutMutation.mutate(undefined)
  }

  const sendToast = (data: { code: string, description: string }) => {
    toast.error(t(`error.title.${data.code}`), {
      description: `${t(`error.description.${data.code}`)} ${data.description}`,
    })
  }

  useEffect(() => {
    void refresh()
    setupAxiosInterceptors({ logout, refresh, sendToast })
  }, [])

  useEffect(() => {
    const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (storedUser)
      setUser(JSON.parse(storedUser))
  }, [])

  useEffect(() => {
    if (user)
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user))
    else
      localStorage.removeItem(LOCAL_STORAGE_KEY)
  }, [user])

  const value: AuthContextType = useMemo(
    () => ({
      state,
      user,
      permissions,
      dispatch,
      login,
      logout,
      refresh,
    }),
    [state, user, permissions],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
