import { useMemo, useState } from 'react'

import { abilityLabels, defaultAttributeArray } from '@/data'
import { useI18n } from '@/features/i18n/use-i18n'
import { abilityOrder, abilityModifier, formatModifier } from '@/utils/dnd-calculations'
import { cn } from '@/utils/cn'
import type { AbilityKey } from '@/types/dnd'

interface AttributeDndProps {
  values: Record<AbilityKey, number>
  raceBonus?: Partial<Record<AbilityKey, number>>
  onChange: (ability: AbilityKey, value: number) => void
}

export function AttributeDnd({ values, raceBonus, onChange }: AttributeDndProps) {
  const [dragging, setDragging] = useState<number | null>(null)
  const { t } = useI18n()

  const assignedValues = useMemo(() => Object.values(values), [values])
  const remaining = defaultAttributeArray.filter((value) => !assignedValues.includes(value))

  function onDrop(ability: AbilityKey) {
    if (dragging === null) {
      return
    }

    const existingAbility = abilityOrder.find((item) => values[item] === dragging)
    if (existingAbility && existingAbility !== ability) {
      const current = values[ability]
      onChange(existingAbility, current)
    }

    onChange(ability, dragging)
    setDragging(null)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 border bg-muted/20 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold">Array padrão</h4>
          <p className="text-xs text-muted-foreground">Arraste um valor ou selecione diretamente em cada atributo.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {defaultAttributeArray.map((value, index) => {
            const inUse = assignedValues.includes(value)
            return (
              <button
                key={`${value}-${index}`}
                type="button"
                draggable
                onDragStart={() => setDragging(value)}
                className={cn(
                  'rounded-sm border px-3 py-1.5 text-sm font-bold',
                  inUse ? 'cursor-grab border-primary/30 bg-primary/10 text-primary' : 'cursor-grab bg-background',
                )}
              >
                {value}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {remaining.length > 0 ? `Valores ainda livres: ${remaining.join(', ')}` : 'Todos os 6 valores já foram distribuídos.'}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {abilityOrder.map((ability) => {
          const base = values[ability]
          const bonus = raceBonus?.[ability] ?? 0
          const finalValue = base + bonus
          const mod = abilityModifier(finalValue)

          return (
            <div
              key={ability}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => onDrop(ability)}
              className="space-y-2 rounded-sm border bg-card p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{abilityLabels[ability]}</p>
                  <p className="text-xs text-muted-foreground">Base {base}{bonus ? ` + racial ${bonus}` : ''}</p>
                </div>
                <select
                  value={base}
                  onChange={(event) => onChange(ability, Number(event.target.value))}
                  className="rounded-sm border border-input bg-background px-2 py-1 text-sm"
                >
                  {defaultAttributeArray.map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end justify-between gap-2">
                <p className="text-lg font-bold">{finalValue} ({formatModifier(mod)})</p>
                <p className="text-xs text-muted-foreground">{t('common.level') === 'Level' ? 'Live modifier' : 'Modificador em tempo real'}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
