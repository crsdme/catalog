import { Link } from 'react-router-dom'
import { Button, LogoIcon } from '@/components/ui'
import { ADMIN_LOGIN_PATH } from '@/utils/constants'
import { useLocale } from '@/utils/hooks'

export function HomePage() {
  const { t } = useLocale()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex items-center justify-center gap-3">
        <LogoIcon className="size-10" />
        <p className="text-2xl font-medium">Catalog</p>
      </div>
      <p className="max-w-md text-center text-muted-foreground">{t('page.home.description')}</p>
      <Button asChild>
        <Link to={ADMIN_LOGIN_PATH}>{t('page.home.adminLogin')}</Link>
      </Button>
    </div>
  )
}
