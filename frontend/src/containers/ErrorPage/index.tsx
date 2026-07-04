import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'

export function ErrorPage({ status, backTo = '/admin' }: { status: number, backTo?: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl font-bold">{t(`page.error.title.${status}`)}</h1>
      <p className="text-lg text-muted-foreground">{t(`page.error.description.${status}`)}</p>
      <Button className="mt-4" onClick={() => void navigate(backTo)}>
        {t('button.back')}
      </Button>
    </div>
  )
}
