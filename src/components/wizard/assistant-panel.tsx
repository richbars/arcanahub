import { Sparkles } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/features/i18n/use-i18n'

interface AssistantPanelProps {
  recommendations: string[]
}

export function AssistantPanel({ recommendations }: AssistantPanelProps) {
  const { t } = useI18n()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4" />
          {t('panels.assistantTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {recommendations.map((item) => (
            <li key={item} className="rounded-md border bg-muted/30 p-2">{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
