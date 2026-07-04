import { Outlet } from 'react-router-dom'
import { LanguageButton, LayoutSidebar, ThemeButton } from '@/components'
import { Button, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui'
import { Separator } from '@/components/ui/separator'
import { useAuthContext } from '@/contexts'
import { useLocale } from '@/utils/hooks'

export default function Layout() {
  const { logout, user } = useAuthContext()
  const { t } = useLocale()

  return (
    <SidebarProvider>
      <LayoutSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 min-h-6" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name}</span>
            <ThemeButton />
            <LanguageButton />
            <Button variant="outline" size="sm" onClick={() => logout()}>
              {t('button.logout')}
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
