import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Toaster } from '@/components/ui/sonner'

const LOCAL_STORAGE_KEY = 'theme'

interface Theme {
  language: string
  layoutTheme: string
}

interface ThemeContextType {
  theme: Theme
  updateTheme: (newTheme: Partial<Theme>) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState({ language: 'en', layoutTheme: 'light' })
  const { i18n } = useTranslation()

  const updateTheme = ({ language, layoutTheme }: Partial<Theme>) => {
    setTheme(state => ({
      ...state,
      language: language ?? state.language,
      layoutTheme: layoutTheme ?? state.layoutTheme,
    }))
    if (language)
      void i18n.changeLanguage(language)
    if (layoutTheme)
      document.documentElement.classList.toggle('dark', layoutTheme === 'dark')
  }

  useEffect(() => {
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (storedTheme)
      updateTheme(JSON.parse(storedTheme))
  }, [])

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(theme))
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      <Toaster position="bottom-right" richColors />
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider')
  }
  return context
}
