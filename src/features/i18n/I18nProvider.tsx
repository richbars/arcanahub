import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { I18nContext, type I18nContextValue } from '@/features/i18n/i18n-context'
import { enUS } from '@/locales/en-US'
import { ptBR } from '@/locales/pt-BR'
import type { Locale } from '@/types/dnd'

const STORAGE_KEY = 'dnd-builder-locale'

const dictionaries = {
  'pt-BR': ptBR,
  'en-US': enUS,
} as const

interface Dictionary {
  [key: string]: string | Dictionary
}

function resolveKey(dictionary: Dictionary, key: string): string | undefined {
  return key.split('.').reduce<unknown>((current, segment) => {
    if (typeof current !== 'object' || current === null || !(segment in current)) {
      return undefined
    }

    return (current as Record<string, unknown>)[segment]
  }, dictionary) as string | undefined
}

function applyParams(template: string, params?: Record<string, string | number>) {
  if (!params) {
    return template
  }

  return Object.entries(params).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, String(value)), template)
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'en-US' ? 'en-US' : 'pt-BR'
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale: (nextLocale) => setLocaleState(nextLocale),
    t: (key, params) => {
      const currentDictionary = dictionaries[locale]
      const fallback = resolveKey(dictionaries['pt-BR'], key) ?? key
      const template = resolveKey(currentDictionary, key) ?? fallback
      return applyParams(template, params)
    },
  }), [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
