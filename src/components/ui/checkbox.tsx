import type { InputHTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn('size-4 rounded border-border bg-background accent-primary', className)}
      {...props}
    />
  )
}
