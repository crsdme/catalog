import { useAppSettingsContext } from '@/contexts'
import { useLocale } from '@/utils/hooks'

export function DashboardPage() {
  const { t } = useLocale()
  const { getSetting } = useAppSettingsContext()
  const appName = getSetting('app:name') ?? 'Catalog'

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">{appName}</h1>
        <p className="text-muted-foreground">{t('description.dashboard')}</p>
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-[200px] rounded-xl bg-muted/50" />
    </div>
  )
}
