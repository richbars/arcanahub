import { Languages } from 'lucide-react'

import { Select } from '@/components/ui/select'
import { useI18n } from '@/features/i18n/use-i18n'
import type { Locale } from '@/types/dnd'

export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n()

  return (
    <label className="flex items-center gap-2 text-sm">
      <Languages className="size-4 text-muted-foreground" />
      <span className="sr-only">{t('app.languageLabel')}</span>
      <Select
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        aria-label={t('app.languageLabel')}
        className="min-w-36"
      >
        <option value="pt-BR">🇧🇷 {t('app.languagePortuguese')}</option>
        <option value="en-US">🇺🇸 {t('app.languageEnglish')}</option>
      </Select>
    </label>
  )
}
