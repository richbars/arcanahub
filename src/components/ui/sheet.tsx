import type { HTMLAttributes, ReactNode } from 'react'

import { useI18n } from '@/features/i18n/use-i18n'
import { cn } from '@/utils/cn'

interface SheetProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Sheet({ open, onClose, title, className, children }: SheetProps) {
  const { t } = useI18n()

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-4 md:hidden" onClick={onClose}>
      <div
        className={cn('absolute bottom-0 left-0 right-0 max-h-[82vh] overflow-y-auto rounded-t-2xl border bg-card p-5', className)}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-md border px-2 py-1 text-sm">
            {t('common.close')}
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
