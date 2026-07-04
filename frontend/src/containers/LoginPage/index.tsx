import { LanguageButton, ThemeButton } from '@/components'
import { LogoIcon } from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { LoginForm } from './components/login-form'

export function LoginPage() {
  const { t } = useLocale()

  return (
    <div className="relative flex h-[100vh] w-[100vw]">
      <div className="relative hidden w-1/2 h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center gap-4 text-lg font-medium">
          <LogoIcon className="size-6" />
          Catalog
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">{t('page.login.quote')}</p>
            <footer className="text-sm">{t('page.login.quote.author')}</footer>
          </blockquote>
        </div>
      </div>
      <div className="flex items-center justify-center w-1/2 max-lg:w-full">
        <LoginForm />
        <div className="flex gap-2 absolute right-4 top-4 md:right-8 md:top-8">
          <ThemeButton />
          <LanguageButton />
        </div>
      </div>
    </div>
  )
}
