import { useCallback, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { spellOrigins, spells, classes } from '@/data'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useI18n } from '@/features/i18n/use-i18n'
import { useCharacterStore } from '@/stores/character-store'
import type { SpellData } from '@/types/dnd'
import { spellCastingTime, spellDescription, spellDuration, spellHigherLevels, spellInteractions, spellName, spellRange, spellRestrictions, spellSchool, spellSpecialRules, spellType } from '@/utils/spell-text'

export function SpellCompendiumPage() {
  const { locale, t } = useI18n()
  const { spellId } = useParams()
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [schoolFilter, setSchoolFilter] = useState('')
  const [ritualFilter, setRitualFilter] = useState('')
  const [concentrationFilter, setConcentrationFilter] = useState('')
  const selectedClassId = useCharacterStore((state) => state.draft.classId)
  const selectedRaceId = useCharacterStore((state) => state.draft.raceId)
  const availableOrigins = useMemo(() => {
    return [...spellOrigins].sort((left, right) => {
      const leftRelevant = left.originId === selectedClassId || left.originId === selectedRaceId
      const rightRelevant = right.originId === selectedClassId || right.originId === selectedRaceId

      if (leftRelevant !== rightRelevant) {
        return leftRelevant ? -1 : 1
      }

      if (left.originType !== right.originType) {
        return left.originType === 'race' ? -1 : 1
      }

      const leftName = locale === 'en-US' ? left.originNameEn : left.originName
      const rightName = locale === 'en-US' ? right.originNameEn : right.originName
      return leftName.localeCompare(rightName)
    })
  }, [locale, selectedClassId, selectedRaceId])

  const selectedSpell = useMemo(
    () => spells.find((spell) => spell.id === spellId) ?? spells[0],
    [spellId],
  )

  const schoolOptions = useMemo(
    () => Array.from(new Set(spells.map((spell) => spellSchool(spell, locale)))).sort((left, right) => left.localeCompare(right)),
    [locale],
  )

  const query = search.trim().toLowerCase()

  const matchesSpellFilters = useCallback((spell: SpellData, extraTerms: string[] = []) => {
    const haystack = [
      spellName(spell, locale),
      spellDescription(spell, locale),
      ...spell.classeIds,
      ...extraTerms,
    ].join(' ').toLowerCase()

    if (query.length > 0 && !haystack.includes(query)) {
      return false
    }

    if (classFilter && !spell.classeIds.includes(classFilter)) {
      return false
    }

    if (levelFilter && String(spell.nivel) !== levelFilter) {
      return false
    }

    if (schoolFilter && spellSchool(spell, locale) !== schoolFilter) {
      return false
    }

    if (ritualFilter && String(spell.ritual) !== ritualFilter) {
      return false
    }

    if (concentrationFilter && String(spell.concentracao) !== concentrationFilter) {
      return false
    }

    return true
  }, [classFilter, concentrationFilter, levelFilter, locale, query, ritualFilter, schoolFilter])

  const filteredSpells = useMemo(() => {
    return spells.filter((spell) => matchesSpellFilters(spell))
  }, [matchesSpellFilters])

  const filteredOrigins = useMemo(() => {
    return availableOrigins.filter((origin) => {
      const linkedSpell = spells.find((spell) => spell.id === origin.spellId)

      if (!linkedSpell) {
        return false
      }

      return matchesSpellFilters(linkedSpell, [
        origin.originName,
        origin.originNameEn,
        origin.requirement,
        origin.requirementEn,
        origin.scaling,
        origin.scalingEn,
      ])
    })
  }, [availableOrigins, matchesSpellFilters])

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('compendium.title')}</CardTitle>
            <CardDescription>{t('compendium.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('compendium.searchPlaceholder')} />
              <Select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
                <option value="">{t('compendium.filterClass')}: {t('compendium.filterAny')}</option>
                {classes.map((classData) => <option key={classData.id} value={classData.id}>{classData.nome}</option>)}
              </Select>
              <Select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)}>
                <option value="">{t('compendium.filterLevel')}: {t('compendium.filterAny')}</option>
                {Array.from(new Set(spells.map((spell) => spell.nivel))).sort((left, right) => left - right).map((level) => <option key={level} value={String(level)}>{level === 0 ? t('common.cantrips') : `${t('common.level')} ${level}`}</option>)}
              </Select>
              <Select value={schoolFilter} onChange={(event) => setSchoolFilter(event.target.value)}>
                <option value="">{t('compendium.filterSchool')}: {t('compendium.filterAny')}</option>
                {schoolOptions.map((school) => <option key={school} value={school}>{school}</option>)}
              </Select>
              <Select value={ritualFilter} onChange={(event) => setRitualFilter(event.target.value)}>
                <option value="">{t('compendium.filterRitual')}: {t('compendium.filterAny')}</option>
                <option value="true">{t('compendium.ritualYes')}</option>
                <option value="false">{t('compendium.ritualNo')}</option>
              </Select>
              <Select value={concentrationFilter} onChange={(event) => setConcentrationFilter(event.target.value)}>
                <option value="">{t('compendium.filterConcentration')}: {t('compendium.filterAny')}</option>
                <option value="true">{t('compendium.concentrationYes')}</option>
                <option value="false">{t('compendium.concentrationNo')}</option>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">{t('compendium.resultCount', { count: filteredSpells.length })}</p>
            <div className="grid gap-3 md:grid-cols-2">
              {filteredSpells.map((spell) => (
                <Link key={spell.id} to={`/grimorio/${spell.id}`} className="block">
                  <Card className="h-full border-border/70 bg-card/80 transition-colors hover:border-primary/40">
                    <CardHeader className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-base">{spellName(spell, locale)}</CardTitle>
                          <CardDescription>{spellSchool(spell, locale)} • {spellType(spell, locale)} • {spell.nivel}</CardDescription>
                        </div>
                        <Badge>{spellCastingTime(spell, locale)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      <p>{spellDescription(spell, locale)}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-primary/10 text-primary">{spellRange(spell, locale)}</Badge>
                        <Badge className="bg-primary/10 text-primary">{spellDuration(spell, locale)}</Badge>
                        <Badge className="bg-primary/10 text-primary">{spell.componentes}</Badge>
                      </div>
                      <p className="text-xs uppercase tracking-[0.08em]">{spell.classeIds.map((classId) => classes.find((item) => item.id === classId)?.nome ?? classId).join(' • ')}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            {filteredSpells.length === 0 ? <p className="text-sm text-muted-foreground">{t('compendium.empty')}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('compendium.magicalOrigins')}</CardTitle>
            <CardDescription>{t('compendium.magicalOriginsSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {filteredOrigins.map((origin) => {
              const linkedSpell = spells.find((spell) => spell.id === origin.spellId)
              const isRelevant = origin.originId === selectedClassId || origin.originId === selectedRaceId
              if (!linkedSpell) {
                return null
              }

              return (
                <Link key={origin.id} to={`/grimorio/${linkedSpell.id}`} className="block">
                  <Card className={`h-full text-sm transition-colors hover:border-primary/40 ${isRelevant ? 'border-primary/40 bg-primary/5' : 'bg-muted/20'}`}>
                    <CardContent className="p-3">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{spellName(linkedSpell, locale)}</p>
                          <p className="text-muted-foreground">{locale === 'en-US' ? origin.originNameEn : origin.originName}</p>
                        </div>
                        <Badge className="bg-primary/10 text-primary">
                          {origin.originType === 'race' ? (locale === 'en-US' ? 'Race' : 'Raça') : (locale === 'en-US' ? 'Class' : 'Classe')}
                        </Badge>
                      </div>
                      <p className="mt-2 text-muted-foreground">{locale === 'en-US' ? origin.requirementEn : origin.requirement}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.08em] text-muted-foreground">{locale === 'en-US' ? origin.scalingEn : origin.scaling}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
            {filteredOrigins.length === 0 ? <p className="text-sm text-muted-foreground">{t('compendium.empty')}</p> : null}
          </CardContent>
        </Card>
      </section>

      <aside>
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>{t('compendium.details')}</CardTitle>
            <CardDescription>{spellName(selectedSpell, locale)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-sm border bg-muted/20 p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{t('compendium.generalInfo')}</p>
                <p className="mt-2">{spellSchool(selectedSpell, locale)}</p>
                <p>{spellCastingTime(selectedSpell, locale)}</p>
                <p>{spellRange(selectedSpell, locale)}</p>
                <p>{spellDuration(selectedSpell, locale)}</p>
              </div>
              <div className="rounded-sm border bg-muted/20 p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{t('compendium.classesAvailable')}</p>
                <p className="mt-2">{selectedSpell.classeIds.map((classId) => classes.find((item) => item.id === classId)?.nome ?? classId).join(', ')}</p>
                <p>{t('compendium.filterRitual')}: {t(selectedSpell.ritual ? 'compendium.ritualYes' : 'compendium.ritualNo')}</p>
                <p>{t('compendium.filterConcentration')}: {t(selectedSpell.concentracao ? 'compendium.concentrationYes' : 'compendium.concentrationNo')}</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">{t('compendium.description')}</p>
              <p className="text-muted-foreground">{spellDescription(selectedSpell, locale)}</p>
            </div>
            {spellHigherLevels(selectedSpell, locale) ? (
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">{t('compendium.higherLevels')}</p>
                <p className="text-muted-foreground">{spellHigherLevels(selectedSpell, locale)}</p>
              </div>
            ) : null}
            {spellSpecialRules(selectedSpell, locale).length > 0 ? (
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">{t('compendium.specialRules')}</p>
                <ul className="space-y-1 text-muted-foreground">
                  {spellSpecialRules(selectedSpell, locale).map((rule) => <li key={rule}>• {rule}</li>)}
                </ul>
              </div>
            ) : null}
            {spellRestrictions(selectedSpell, locale).length > 0 ? (
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">{t('compendium.restrictions')}</p>
                <ul className="space-y-1 text-muted-foreground">
                  {spellRestrictions(selectedSpell, locale).map((rule) => <li key={rule}>• {rule}</li>)}
                </ul>
              </div>
            ) : null}
            {spellInteractions(selectedSpell, locale).length > 0 ? (
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">{t('compendium.interactions')}</p>
                <ul className="space-y-1 text-muted-foreground">
                  {spellInteractions(selectedSpell, locale).map((rule) => <li key={rule}>• {rule}</li>)}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
