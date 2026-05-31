import { motion } from 'framer-motion'

import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/features/i18n/use-i18n'
import { cn } from '@/utils/cn'

interface StepperProps {
  steps: string[]
  currentStep: number
  onStepSelect: (index: number) => void
}

export function Stepper({ steps, currentStep, onStepSelect }: StepperProps) {
  const progress = (currentStep / steps.length) * 100
  const { t } = useI18n()

  return (
    <div className="border bg-card p-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-[0.06em]">{t('stepper.stepOf', { current: currentStep, total: steps.length })}</p>
        <p className="text-xs text-muted-foreground">{t('stepper.percentComplete', { value: Math.round(progress) })}</p>
      </div>
      <Progress value={progress} className="mb-4" />
      <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4 xl:grid-cols-6">
        {steps.map((label, index) => {
          const stepNumber = index + 1
          const active = stepNumber === currentStep
          const done = stepNumber < currentStep

          return (
            <motion.button
              whileHover={{ y: -1 }}
              key={label}
              type="button"
              onClick={() => onStepSelect(stepNumber)}
              className={cn(
                'rounded-sm border px-2 py-1.5 text-left text-xs transition-colors',
                active && 'border-primary bg-primary/15 text-primary',
                done && !active && 'border-accent/60 bg-accent/10 text-accent',
                !active && !done && 'text-muted-foreground hover:bg-muted/60',
              )}
            >
              <span className="mr-2 inline-flex size-4 items-center justify-center rounded-sm border text-[10px]">
                {stepNumber}
              </span>
              {label}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
