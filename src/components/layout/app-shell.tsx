import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

import { Crown } from 'lucide-react'

import { LanguageSelector } from '@/components/layout/language-selector'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { useI18n } from '@/features/i18n/use-i18n'
import { cn } from '@/utils/cn'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { t } = useI18n()

  return (
    <div className="mx-auto min-h-screen w-full max-w-[1320px] px-3 py-4 md:px-6">
      <header className="mb-4 space-y-4 border bg-card px-4 py-3">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-sm border border-primary/40 bg-primary/20 p-2 text-primary">
              <Crown className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-wide">{t('app.title')}</h1>
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{t('app.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
        <nav className="flex flex-wrap gap-2 border-t border-border/60 pt-3">
          <NavLink
            to="/"
            end
            className={({ isActive }) => cn('rounded-sm border px-3 py-1.5 text-sm transition-colors', isActive ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50')}
          >
            {t('app.navBuilder')}
          </NavLink>
          <NavLink
            to="/grimorio"
            className={({ isActive }) => cn('rounded-sm border px-3 py-1.5 text-sm transition-colors', isActive ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50')}
          >
            {t('app.navCompendium')}
          </NavLink>
        </nav>
      </header>
      {children}
    </div>
  )
}
