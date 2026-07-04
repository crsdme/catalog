import type { SupportedLanguage } from '@/utils/constants'
import { useTranslation } from 'react-i18next'

export function useLocale() {
  const { t, i18n } = useTranslation()

  const language: SupportedLanguage
    = i18n.resolvedLanguage === 'ru' || i18n.resolvedLanguage === 'en'
      ? i18n.resolvedLanguage
      : 'en'

  return { t, i18n, language }
}
