import { ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/features/i18n/use-i18n'
import type { ComboData } from '@/types/dnd'

interface ComboPanelProps {
  combo?: ComboData
  raceName?: string
  className?: string
}

export function ComboPanel({ combo, raceName, className }: ComboPanelProps) {
  const { t } = useI18n()

  if (!combo) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="size-4" />
          {t('panels.comboTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="font-semibold">{raceName} + {className}</p>
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/20 text-primary">{t('panels.comboScore', { value: combo.nota })}</Badge>
        </div>
        <p className="text-muted-foreground">{combo.motivo}</p>
      </CardContent>
    </Card>
  )
}
