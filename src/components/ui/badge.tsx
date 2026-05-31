import type { HTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}
