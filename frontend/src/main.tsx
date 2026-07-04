import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { AppSettingsProvider, AuthProvider, ThemeProvider } from '@/contexts'
import App from './app/App'
import '@/locales/i18n.ts'

const queryClient = new QueryClient()

const rootElement = document.getElementById('root')

if (!rootElement)
  throw new Error('Root element #root not found')

createRoot(rootElement).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AppSettingsProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppSettingsProvider>
    </ThemeProvider>
  </QueryClientProvider>,
)
