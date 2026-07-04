import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LOCAL_STORAGE_KEY = 'settings'

export interface AppSetting {
  key: string
  value: string
}

interface AppSettingsContextType {
  settings: AppSetting[]
  setSettings: (settings: AppSetting[]) => void
  getSetting: (key: string) => string | undefined
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined)

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<AppSetting[]>([])

  const setSettings = (next: AppSetting[]) => {
    setSettingsState(next)
  }

  const getSetting = (key: string) => settings.find(setting => setting.key === key)?.value

  useEffect(() => {
    const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (storedSettings)
      setSettingsState(JSON.parse(storedSettings))
  }, [])

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const value = useMemo(
    () => ({ settings, setSettings, getSetting }),
    [settings],
  )

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>
}

export function useAppSettingsContext(): AppSettingsContextType {
  const context = useContext(AppSettingsContext)
  if (!context)
    throw new Error('useAppSettingsContext must be used within AppSettingsProvider')
  return context
}
