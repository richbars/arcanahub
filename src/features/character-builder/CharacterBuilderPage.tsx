import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Component,
  Copy,
  Download,
  FileDown,
  Hourglass,
  Printer,
  Save,
  Target,
  ScrollText,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { AssistantPanel } from '@/components/wizard/assistant-panel'
import { AttributeDnd } from '@/components/wizard/attribute-dnd'
import { ComboPanel } from '@/components/wizard/combo-panel'
import { Stepper } from '@/components/wizard/stepper'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Sheet } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import {
  alignments,
  backgrounds,
  classes,
  combos,
  defaultAttributeArray,
  equipment,
  feats,
  races,
  racialLanguages,
  skills,
  spellOrigins,
  spells,
  subclasses,
} from '@/data'
import { useI18n } from '@/features/i18n/use-i18n'
import { basicInfoSchema, type BasicInfoFormValues } from '@/schemas/character-schema'
import { useCharacterStore } from '@/stores/character-store'
import { exportCharacterJson, exportCharacterPdf, importCharacterFromJson, printCharacterSheet } from '@/utils/export-utils'
import { abilityLabel, deriveStats, formatModifier, getBackgroundById, getClassById, getEquipmentChoiceGroups, getRaceById } from '@/utils/dnd-calculations'
import { spellName } from '@/utils/spell-text'

const wizardSteps = [
  'Nível',
  'Raça',
  'Classe',
  'Arquétipo',
  'Antecedente',
  'Idiomas',
  'Atributos',
  'Equipamentos',
  'Finalização',
]

const languages = ['Comum', 'Anao', 'Elfico', 'Gigante', 'Gnomico', 'Goblin', 'Orc', 'Draconico', 'Infernal', 'Celestial']

const classTips: Record<string, string> = {
  guerreiro: 'Considere priorizar Forca e Constituicao.',
  mago: 'Inteligencia e seu atributo mais importante.',
  ladino: 'Destreza geralmente e sua prioridade.',
  barbaro: 'Forca e Constituicao deixam seu barbaro muito resistente.',
  clerigo: 'Sabedoria melhora suas magias e habilidades de suporte.',
  patrulheiro: 'Destreza e Sabedoria costumam ser os atributos prioritarios.',
}

const raceTips: Record<string, string> = {
  humano: 'Humanos sao extremamente versateis.',
  elfo: 'Elfos combinam muito com classes baseadas em Destreza.',
  anao: 'Anoes funcionam muito bem em papeis defensivos.',
}

function maxSpellLevelBySlots(slotMap: Record<number, number>) {
  const levels = Object.entries(slotMap)
    .filter(([, value]) => value > 0)
    .map(([key]) => Number(key))

  return levels.length ? Math.max(...levels) : 0
}

function backgroundLanguageChoiceCount(backgroundLanguages: string[] = []) {
  return backgroundLanguages.reduce((count, entry) => {
    const normalized = entry.toLowerCase()
    if (normalized.includes('escolha 2')) {
      return count + 2
    }
    if (normalized.includes('um idioma') || normalized.includes('1 idioma') || normalized.includes('escolha')) {
      return count + 1
    }
    return count
  }, 0)
}

function fixedBackgroundLanguages(backgroundLanguages: string[] = []) {
  return backgroundLanguages.filter((entry) => !entry.toLowerCase().includes('idioma'))
}

export function CharacterBuilderPage() {
  const { locale, t } = useI18n()
  const {
    currentStep,
    draft,
    savedCharacters,
    loadingSaved,
    setCurrentStep,
    updateDraft,
    updateBasicInfo,
    setAttribute,
    setSelectedSkills,
    setEquipmentChoice,
    setSelectedEquipment,
    setSelectedSpells,
    toggleFeat,
    saveCurrent,
    loadSaved,
    loadCharacter,
    duplicateCharacterById,
    deleteCharacterById,
    importCharacter,
    resetDraft,
  } = useCharacterStore()

  const [saving, setSaving] = useState(false)
  const [showAssistantOnMobile, setShowAssistantOnMobile] = useState(false)
  const derived = useMemo(() => deriveStats(draft), [draft])

  const selectedRace = getRaceById(draft.raceId)
  const selectedClass = getClassById(draft.classId)
  const selectedBackground = getBackgroundById(draft.backgroundId)
  const selectedCombo = combos.find((item) => item.classId === draft.classId && item.raceId === draft.raceId)
  const equipmentChoiceGroups = useMemo(() => getEquipmentChoiceGroups(draft), [draft])

  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    values: draft.basicInfo,
  })
  const selectedAlignment = useWatch({
    control: form.control,
    name: 'alinhamento',
    defaultValue: draft.basicInfo.alinhamento,
  })

  useEffect(() => {
    void loadSaved()
  }, [loadSaved])

  const recommendations = useMemo(() => {
    const base = [
      'Distribua os valores 15, 14, 13, 12, 10 e 8 sem repetir.',
      'Revise as pericias da classe para maximizar seu papel no grupo.',
    ]

    if (classTips[draft.classId]) {
      base.unshift(classTips[draft.classId])
    }

    if (raceTips[draft.raceId]) {
      base.unshift(raceTips[draft.raceId])
    }

    return base
  }, [draft.classId, draft.raceId])

  const availableClassSkills = useMemo(() => {
    const classData = classes.find((item) => item.id === draft.classId)
    if (!classData) {
      return []
    }

    const blockedNames = new Set(selectedBackground?.pericias ?? [])

    return skills.filter((item) => classData.periciasEscolha.opcoes.includes(item.nome) && !blockedNames.has(item.nome))
  }, [draft.classId, selectedBackground])

  const availableSpells = useMemo(() => {
    const maxLevel = maxSpellLevelBySlots(derived.magicSlots)
    return spells.filter((spell) => spell.classeIds.includes(draft.classId) && spell.nivel <= maxLevel)
  }, [derived.magicSlots, draft.classId])
  const availableOrigins = useMemo(
    () => spellOrigins.filter((origin) => origin.originId === draft.classId || origin.originId === draft.raceId),
    [draft.classId, draft.raceId],
  )

  const availableSubclasses = useMemo(
    () => subclasses.filter((item) => item.classId === draft.classId),
    [draft.classId],
  )
  const unlockedSubclasses = availableSubclasses.filter((item) => draft.level >= item.nivelDesbloqueio)
  const automaticLanguages = useMemo(() => Array.from(new Set([
    ...(racialLanguages[draft.raceId] ?? []),
    ...fixedBackgroundLanguages(selectedBackground?.idiomas),
  ])), [draft.raceId, selectedBackground])
  const bonusLanguageSlots = useMemo(
    () => backgroundLanguageChoiceCount(selectedBackground?.idiomas),
    [selectedBackground],
  )
  const manualLanguageOptions = useMemo(
    () => languages.filter((language) => !automaticLanguages.includes(language)),
    [automaticLanguages],
  )
  const manualPurchaseItems = useMemo(
    () => equipment.filter((item) => item.categoria !== 'Antecedente'),
    [],
  )

  useEffect(() => {
    if (draft.subclassId && !unlockedSubclasses.some((item) => item.id === draft.subclassId)) {
      updateDraft({ subclassId: '' })
    }
  }, [draft.subclassId, unlockedSubclasses, updateDraft])

  useEffect(() => {
    if (draft.featIds.length > derived.featSlots) {
      updateDraft({ featIds: draft.featIds.slice(0, derived.featSlots) })
    }
  }, [derived.featSlots, draft.featIds, updateDraft])

  useEffect(() => {
    if (draft.basicInfo.idiomas.length > bonusLanguageSlots) {
      updateBasicInfo({ idiomas: draft.basicInfo.idiomas.slice(0, bonusLanguageSlots) })
    }
  }, [bonusLanguageSlots, draft.basicInfo.idiomas, updateBasicInfo])

  async function onSave() {
    setSaving(true)
    try {
      await saveCurrent()
    } finally {
      setSaving(false)
    }
  }

  async function onImportFile(file: File) {
    const parsed = await importCharacterFromJson(file)
    await importCharacter(parsed)
  }

  async function onExportPdf() {
    await exportCharacterPdf(draft, derived)
  }

  const canGoNext = currentStep < wizardSteps.length
  const canGoBack = currentStep > 1

  function nextStep() {
    if (canGoNext) {
      setCurrentStep(currentStep + 1)
    }
  }

  function prevStep() {
    if (canGoBack) {
      setCurrentStep(currentStep - 1)
    }
  }

  function renderStep() {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Etapa 1 - Nivel</CardTitle>
              <CardDescription>Defina o nivel primeiro para liberar arquétipos, talentos, magias e recursos da classe.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Select
                  value={String(draft.level)}
                  onChange={(event) => updateDraft({ level: Number(event.target.value) })}
                >
                  {Array.from({ length: 20 }, (_, index) => {
                    const level = index + 1
                    return <option key={level} value={level}>Nivel {level}</option>
                  })}
                </Select>
                <Badge>Nivel atual: {draft.level}</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="border bg-muted/20 p-3 text-sm">
                  <p className="font-semibold">HP previsto</p>
                  <p className="text-muted-foreground">{derived.hp}</p>
                </div>
                <div className="border bg-muted/20 p-3 text-sm">
                  <p className="font-semibold">Bonus de proficiencia</p>
                  <p className="text-muted-foreground">{formatModifier(derived.proficiencyBonus)}</p>
                </div>
                <div className="border bg-muted/20 p-3 text-sm">
                  <p className="font-semibold">Talentos disponiveis</p>
                  <p className="text-muted-foreground">{derived.featSlots}</p>
                </div>
                <div className="border bg-muted/20 p-3 text-sm">
                  <p className="font-semibold">Maior circulo de magia</p>
                  <p className="text-muted-foreground">{maxSpellLevelBySlots(derived.magicSlots) || 'Sem magia'}</p>
                </div>
              </div>
              <div className="border bg-muted/20 p-3 text-sm">
                <p><strong>Progresso de classe:</strong> {selectedClass?.progressionNotes[draft.level] ?? 'Escolha uma classe para ver os recursos do nivel.'}</p>
                {Object.keys(derived.magicSlots).length > 0 ? (
                  <p><strong>Espacos de magia:</strong> {Object.entries(derived.magicSlots).map(([lvl, qty]) => `${qty}x nivel ${lvl}`).join(', ')}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        )
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Etapa 2 - Raca</CardTitle>
              <CardDescription>Selecione a raça antes das demais escolhas derivadas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {races.map((race) => (
                  <button
                    type="button"
                    key={race.id}
                    onClick={() => updateDraft({ raceId: race.id })}
                    className={`rounded-lg border p-3 text-left transition ${draft.raceId === race.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'}`}
                  >
                    <p className="font-semibold">{race.nome}</p>
                    <p className="text-xs text-muted-foreground">{race.descricao}</p>
                  </button>
                ))}
              </div>
              {selectedRace && (
                <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-1 font-semibold">Resumo</h4>
                    <p className="text-sm text-muted-foreground">{selectedRace.descricao}</p>
                    <h4 className="mb-1 mt-3 font-semibold">Vantagens</h4>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                      {selectedRace.vantagens.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold">Idiomas raciais</h4>
                    <p className="text-sm text-muted-foreground">{(racialLanguages[draft.raceId] ?? []).join(', ') || 'Nenhum idioma automatico.'}</p>
                    <h4 className="mb-1 mt-3 font-semibold">Dicas</h4>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                      {selectedRace.dicas.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Etapa 3 - Classe</CardTitle>
              <CardDescription>Escolha a classe que define seu estilo de jogo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {classes.map((classData) => (
                  <button
                    type="button"
                    key={classData.id}
                    onClick={() => updateDraft({ classId: classData.id, subclassId: '', selectedSkills: [], selectedSpellIds: [], equipmentChoices: {}, featIds: [] })}
                    className={`rounded-lg border p-3 text-left transition ${draft.classId === classData.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'}`}
                  >
                    <p className="font-semibold">{classData.nome}</p>
                    <p className="text-xs text-muted-foreground">{classData.descricao}</p>
                    <p className="mt-2 text-xs">Complexidade: {'⭐'.repeat(classData.complexidade)}</p>
                  </button>
                ))}
              </div>
              {selectedClass && (
                <div className="rounded-lg border bg-muted/20 p-4 text-sm">
                  <p className="mb-2 text-muted-foreground">{selectedClass.descricao}</p>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {selectedClass.role.map((role) => <Badge key={role}>{role}</Badge>)}
                  </div>
                  <p><strong>Pontos fortes:</strong> {selectedClass.pontosFortes.join(', ')}</p>
                  <p><strong>Pontos fracos:</strong> {selectedClass.pontosFracos.join(', ')}</p>
                  <p><strong>Dados de vida:</strong> d{selectedClass.hitDie}</p>
                  <p><strong>Proficiências:</strong> {selectedClass.proficiencias.join(', ')}</p>
                  <p><strong>Equipamentos iniciais:</strong> {selectedClass.equipamentosIniciais.join(', ')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Etapa 4 - Arquétipo</CardTitle>
              <CardDescription>Escolha seu arquétipo quando o nivel atual ja o liberar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedClass ? (
                <p className="text-sm text-muted-foreground">Escolha uma classe antes de selecionar o arquétipo.</p>
              ) : unlockedSubclasses.length === 0 ? (
                <div className="border bg-muted/20 p-4 text-sm text-muted-foreground">
                  <p>Esta classe libera arquétipo apenas a partir do nivel {availableSubclasses[0]?.nivelDesbloqueio ?? '-' }.</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {unlockedSubclasses.map((subclass) => (
                    <button
                      type="button"
                      key={subclass.id}
                      onClick={() => updateDraft({ subclassId: subclass.id })}
                      className={`rounded-lg border p-3 text-left transition ${draft.subclassId === subclass.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'}`}
                    >
                      <p className="font-semibold">{subclass.nome}</p>
                      <p className="text-xs text-muted-foreground">Desbloqueio: nivel {subclass.nivelDesbloqueio}</p>
                      <p className="mt-1 text-xs">{subclass.descricao}</p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Etapa 5 - Antecedente</CardTitle>
              <CardDescription>Defina passado, contatos, ferramentas e idiomas adicionais do antecedente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                {backgrounds.map((background) => (
                  <button
                    type="button"
                    key={background.id}
                    onClick={() => updateDraft({ backgroundId: background.id })}
                    className={`rounded-lg border p-3 text-left transition ${draft.backgroundId === background.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'}`}
                  >
                    <p className="font-semibold">{background.nome}</p>
                    <p className="text-xs text-muted-foreground">{background.descricao}</p>
                    <p className="mt-2 text-xs">Pericias: {background.pericias.join(', ')}</p>
                    {background.ferramentas.length > 0 ? <p className="text-xs">Ferramentas: {background.ferramentas.join(', ')}</p> : null}
                    {background.idiomas.length > 0 ? <p className="text-xs">Idiomas: {background.idiomas.join(', ')}</p> : null}
                  </button>
                ))}
              </div>
              {selectedBackground && (
                <div className="border bg-muted/20 p-4 text-sm">
                  <p><strong>Idiomas concedidos:</strong> {selectedBackground.idiomas.join(', ') || 'Nenhum'}</p>
                  <p><strong>Ferramentas:</strong> {selectedBackground.ferramentas.join(', ') || 'Nenhuma'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      case 6:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Etapa 6 - Idiomas</CardTitle>
              <CardDescription>Escolha os idiomas manuais somente depois de raça, classe, arquétipo e antecedente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="border bg-muted/20 p-3 text-sm">
                  <p className="font-semibold">Idiomas automaticos</p>
                  <p className="text-muted-foreground">{automaticLanguages.join(', ') || 'Nenhum'}</p>
                </div>
                <div className="border bg-muted/20 p-3 text-sm">
                  <p className="font-semibold">Escolhas adicionais</p>
                  <p className="text-muted-foreground">{bonusLanguageSlots}</p>
                </div>
                <div className="border bg-muted/20 p-3 text-sm">
                  <p className="font-semibold">Total final previsto</p>
                  <p className="text-muted-foreground">{derived.languages.join(', ') || 'Nenhum'}</p>
                </div>
              </div>
              {bonusLanguageSlots === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma escolha manual de idioma e necessaria para essa combinacao.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {manualLanguageOptions.map((language) => {
                    const selected = draft.basicInfo.idiomas.includes(language)
                    const blocked = !selected && draft.basicInfo.idiomas.length >= bonusLanguageSlots

                    return (
                      <label key={language} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                        <Checkbox
                          checked={selected}
                          disabled={blocked}
                          onChange={(event) => {
                            if (event.target.checked) {
                              updateBasicInfo({ idiomas: [...draft.basicInfo.idiomas, language] })
                            } else {
                              updateBasicInfo({ idiomas: draft.basicInfo.idiomas.filter((item) => item !== language) })
                            }
                          }}
                        />
                        {language}
                      </label>
                    )
                  })}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Os idiomas raciais e os idiomas fixos do antecedente entram automaticamente; aqui voce escolhe apenas os extras variaveis.</p>
            </CardContent>
          </Card>
        )
      case 7:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Etapa 7 - Atributos</CardTitle>
              <CardDescription>Metodo padrao: {defaultAttributeArray.join(', ')}</CardDescription>
            </CardHeader>
            <CardContent>
              <AttributeDnd
                values={draft.baseAttributes}
                raceBonus={selectedRace?.racialBonuses}
                onChange={(ability, value) => setAttribute(ability, value)}
              />
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="border bg-muted/20 p-3 text-sm">
                  <p className="font-semibold">CA</p>
                  <p className="text-muted-foreground">{derived.ca}</p>
                </div>
                <div className="border bg-muted/20 p-3 text-sm">
                  <p className="font-semibold">HP</p>
                  <p className="text-muted-foreground">{derived.hp}</p>
                </div>
                <div className="border bg-muted/20 p-3 text-sm">
                  <p className="font-semibold">Ataque de magia</p>
                  <p className="text-muted-foreground">{derived.spellAttackBonus === null ? 'Nao aplicavel' : formatModifier(derived.spellAttackBonus)}</p>
                </div>
                <div className="border bg-muted/20 p-3 text-sm">
                  <p className="font-semibold">CD de magia</p>
                  <p className="text-muted-foreground">{derived.spellSaveDC ?? 'Nao aplicavel'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      case 8:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Etapa 8 - Equipamentos</CardTitle>
              <CardDescription>Escolha equipamentos por classe, antecedente e compra inicial, com origem e carga total.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="border bg-muted/20 p-3 text-sm"><p className="font-semibold">Carga transportada</p><p className="text-muted-foreground">{derived.carryingWeight.toFixed(1)} lb</p></div>
                <div className="border bg-muted/20 p-3 text-sm"><p className="font-semibold">CA atual</p><p className="text-muted-foreground">{derived.ca}</p></div>
                <div className="border bg-muted/20 p-3 text-sm"><p className="font-semibold">Ataques calculados</p><p className="text-muted-foreground">{derived.attacks.length}</p></div>
                <div className="border bg-muted/20 p-3 text-sm"><p className="font-semibold">Proficiências</p><p className="text-muted-foreground">{derived.proficiencies.length}</p></div>
              </div>
              <div className="space-y-3">
                {equipmentChoiceGroups.map((group) => (
                  <div key={group.id} className="border p-3">
                    <div className="mb-2">
                      <p className="font-semibold">{group.label}</p>
                      <p className="text-xs text-muted-foreground">{group.sourceLabel}: {group.description}</p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {group.options.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setEquipmentChoice(group.id, option.id)}
                          className={`border p-3 text-left ${draft.equipmentChoices[group.id] === option.id || (!draft.equipmentChoices[group.id] && group.options[0]?.id === option.id) ? 'border-primary bg-primary/10' : 'hover:bg-muted/40'}`}
                        >
                          <p className="font-semibold">{option.label}</p>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                          <p className="mt-2 text-xs">{option.grants.map((grant) => {
                            const item = equipment.find((entry) => entry.id === grant.equipmentId)
                            return `${grant.quantity}x ${item?.nome ?? grant.equipmentId}`
                          }).join(', ')}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold">Compra inicial opcional</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {manualPurchaseItems.map((item) => {
                    const selected = draft.selectedEquipmentIds.includes(item.id)

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          if (selected) {
                            setSelectedEquipment(draft.selectedEquipmentIds.filter((id) => id !== item.id))
                          } else {
                            setSelectedEquipment([...draft.selectedEquipmentIds, item.id])
                          }
                        }}
                        className={`rounded-lg border p-3 text-left transition ${selected ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'}`}
                      >
                        <p className="font-semibold">{item.nome}</p>
                        <p className="text-xs text-muted-foreground">{item.categoria}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.descricao}</p>
                        {item.dano && <p className="text-xs">Dano: {item.dano}</p>}
                        {item.alcance && <p className="text-xs">Alcance: {item.alcance}</p>}
                        {item.propriedades?.length ? <p className="text-xs">Propriedades: {item.propriedades.join(', ')}</p> : null}
                        <p className="text-xs">Peso: {item.peso} lb</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      case 9:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Etapa 9 - Finalizacao da Ficha</CardTitle>
              <CardDescription>Finalize os dados da ficha, revise perícias, talentos, magias e exporte o personagem.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <form
                className="grid gap-4 border p-4 md:grid-cols-2"
                onSubmit={form.handleSubmit((values) => {
                  updateBasicInfo({
                    nome: values.nome,
                    idade: values.idade,
                    altura: values.altura,
                    peso: values.peso,
                    experiencia: values.experiencia,
                    alinhamento: values.alinhamento,
                    historia: values.historia,
                  })
                })}
              >
                <div className="space-y-1">
                  <label htmlFor="nome" className="text-sm">Nome</label>
                  <Input id="nome" {...form.register('nome')} />
                  <p className="text-xs text-destructive">{form.formState.errors.nome?.message}</p>
                </div>
                <div className="space-y-1">
                  <label htmlFor="idade" className="text-sm">Idade</label>
                  <Input id="idade" {...form.register('idade')} />
                </div>
                <div className="space-y-1">
                  <label htmlFor="altura" className="text-sm">Altura</label>
                  <Input id="altura" {...form.register('altura')} />
                </div>
                <div className="space-y-1">
                  <label htmlFor="peso" className="text-sm">Peso</label>
                  <Input id="peso" {...form.register('peso')} />
                </div>
                <div className="space-y-1">
                  <label htmlFor="experiencia" className="text-sm">Experiencia</label>
                  <Input id="experiencia" {...form.register('experiencia')} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label htmlFor="alinhamento" className="text-sm">Alinhamento</label>
                  <Select
                    id="alinhamento"
                    value={selectedAlignment}
                    onChange={(event) => form.setValue('alinhamento', event.target.value as BasicInfoFormValues['alinhamento'])}
                  >
                    {alignments.map((alignment) => (
                      <option value={alignment} key={alignment}>{alignment}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label htmlFor="historia" className="text-sm">Historia resumida</label>
                  <Textarea id="historia" {...form.register('historia')} />
                  <p className="text-xs text-destructive">{form.formState.errors.historia?.message}</p>
                </div>
                <div className="md:col-span-2">
                  <Button type="submit">Aplicar Informacoes Basicas</Button>
                </div>
              </form>

              <div className="border p-4">
                <h4 className="mb-2 text-sm font-semibold">Pericias e talentos</h4>
                <div className="mb-3 flex flex-wrap gap-2">
                  {(selectedBackground?.pericias ?? []).map((skillName) => <Badge key={skillName}>{skillName}</Badge>)}
                </div>
                <p className="mb-2 text-xs text-muted-foreground">Selecione ate {selectedClass?.periciasEscolha.quantidade ?? 0} pericias da classe.</p>
                {availableClassSkills.map((skill) => {
                  const selected = draft.selectedSkills.includes(skill.id)
                  const max = selectedClass?.periciasEscolha.quantidade ?? 0
                  const blocked = !selected && draft.selectedSkills.length >= max

                  return (
                    <label key={skill.id} className="mb-2 flex items-start gap-3 rounded-md border p-3">
                      <Checkbox
                        checked={selected}
                        disabled={blocked}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setSelectedSkills([...draft.selectedSkills, skill.id])
                          } else {
                            setSelectedSkills(draft.selectedSkills.filter((id) => id !== skill.id))
                          }
                        }}
                      />
                      <div>
                        <p className="font-semibold">{skill.nome}</p>
                        <p className="text-xs text-muted-foreground">{skill.descricao}</p>
                      </div>
                    </label>
                  )
                })}

                <h4 className="mb-2 mt-4 text-sm font-semibold">Talentos</h4>
                {derived.featSlots === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum talento disponivel no nivel atual.</p>
                ) : (
                  feats.map((feat) => {
                    const selected = draft.featIds.includes(feat.id)
                    const blocked = !selected && draft.featIds.length >= derived.featSlots

                    return (
                      <label key={feat.id} className="mb-2 flex items-start gap-3 rounded-md border p-3">
                        <Checkbox checked={selected} disabled={blocked} onChange={() => toggleFeat(feat.id)} />
                        <div>
                          <p className="font-semibold">{feat.nome}</p>
                          <p className="text-xs"><strong>Requisitos:</strong> {feat.requisitos.length ? feat.requisitos.join(', ') : 'Nenhum'}</p>
                          <p className="text-xs"><strong>Beneficios:</strong> {feat.beneficios.join(' | ')}</p>
                        </div>
                      </label>
                    )
                  })
                )}
              </div>

              {selectedClass?.conjurador ? (
                <div className="border p-4">
                  <h4 className="mb-2 text-sm font-semibold">Magias</h4>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border bg-muted/20 px-3 py-2 text-xs">
                    <p className="text-muted-foreground">Classe: <strong>{selectedClass.nome}</strong></p>
                    <p className="text-muted-foreground">Nivel maximo de magia: <strong>{maxSpellLevelBySlots(derived.magicSlots)}</strong></p>
                    <p className="text-muted-foreground">Conhecidas: <strong>{draft.selectedSpellIds.length}</strong></p>
                  </div>
                  <div className="space-y-2">
                    {availableSpells.map((spell) => {
                      const selected = draft.selectedSpellIds.includes(spell.id)
                      return (
                        <article
                          key={spell.id}
                          className={`border px-3 py-2 transition ${selected ? 'border-primary bg-primary/5' : 'bg-card hover:bg-muted/40'}`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (selected) {
                                setSelectedSpells(draft.selectedSpellIds.filter((id) => id !== spell.id))
                              } else {
                                setSelectedSpells([...draft.selectedSpellIds, spell.id])
                              }
                            }}
                            className="w-full text-left"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold leading-tight">{spellName(spell, locale)}</p>
                                <p className="text-xs text-muted-foreground">{locale === 'en-US' ? spell.escolaEn.toLowerCase() : spell.escola.toLowerCase()} {spell.nivel === 0 ? t('common.cantrips').toLowerCase() : `${t('common.level').toLowerCase()} ${spell.nivel}`}</p>
                              </div>
                              <span className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] ${selected ? 'border-primary/50 bg-primary/15 text-primary' : 'text-muted-foreground'}`}>
                                <CheckCircle2 className="size-3" />
                                {selected ? (locale === 'en-US' ? 'Known' : 'Conhecida') : (locale === 'en-US' ? 'Add' : 'Adicionar')}
                              </span>
                            </div>
                            <div className="mt-2 grid gap-x-3 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                              <span className="inline-flex items-center gap-1"><Clock3 className="size-3" /> {locale === 'en-US' ? spell.tempoEn : spell.tempo}</span>
                              <span className="inline-flex items-center gap-1"><Target className="size-3" /> {locale === 'en-US' ? spell.alcanceEn : spell.alcance}</span>
                              <span className="inline-flex items-center gap-1"><Component className="size-3" /> {spell.componentes}</span>
                              <span className="inline-flex items-center gap-1"><Hourglass className="size-3" /> {locale === 'en-US' ? spell.duracaoEn : spell.duracao}</span>
                            </div>
                          </button>
                        </article>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <h4 className="mb-2 font-semibold">Informacoes Gerais</h4>
                  <p><strong>Nome:</strong> {draft.basicInfo.nome || 'Sem nome'}</p>
                  <p><strong>Classe:</strong> {selectedClass?.nome}</p>
                  <p><strong>Arquétipo:</strong> {subclasses.find((item) => item.id === draft.subclassId)?.nome || 'Nao definido'}</p>
                  <p><strong>Raca:</strong> {selectedRace?.nome}</p>
                  <p><strong>Antecedente:</strong> {backgrounds.find((item) => item.id === draft.backgroundId)?.nome}</p>
                  <p><strong>Nivel:</strong> {draft.level}</p>
                  <p><strong>Experiencia:</strong> {draft.basicInfo.experiencia}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="mb-2 font-semibold">Combate e Exploracao</h4>
                  <p><strong>HP:</strong> {derived.hp}</p>
                  <p><strong>CA:</strong> {derived.ca}</p>
                  <p><strong>Iniciativa:</strong> {formatModifier(derived.iniciativa)}</p>
                  <p><strong>Deslocamento:</strong> {derived.deslocamento} pes</p>
                  <p><strong>Bonus de Proficiencia:</strong> {formatModifier(derived.proficiencyBonus)}</p>
                  <p><strong>Percepcao passiva:</strong> {derived.passivePerception}</p>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <h4 className="mb-2 font-semibold">Atributos e Modificadores</h4>
                <div className="grid gap-2 md:grid-cols-3">
                  {Object.entries(derived.atributosFinais).map(([key, value]) => (
                    <div key={key} className="rounded-md bg-muted/30 p-2">
                      <p className="text-xs text-muted-foreground">{abilityLabel(key as keyof typeof draft.baseAttributes)}</p>
                      <p className="font-semibold">{value} ({formatModifier(derived.modificadores[key as keyof typeof derived.modificadores])})</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <h4 className="mb-2 font-semibold">Pericias, Resistencias e Proficiências</h4>
                <div className="grid gap-2 md:grid-cols-3">
                  {skills.map((skill) => (
                    <p key={skill.id} className="text-xs">
                      <strong>{skill.nome}</strong>: {formatModifier(derived.skillModifiers[skill.id] ?? 0)}
                    </p>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {Object.entries(derived.savingThrows).map(([ability, value]) => (
                    <p key={ability} className="text-xs"><strong>{abilityLabel(ability as keyof typeof draft.baseAttributes)}</strong>: {formatModifier(value)}</p>
                  ))}
                </div>
                <p className="mt-3 text-xs"><strong>Proficiências:</strong> {derived.proficiencies.join(', ') || 'Nenhuma'}</p>
              </div>

              <div className="rounded-lg border p-3">
                <h4 className="mb-2 font-semibold">Equipamentos, Ataques e Magias</h4>
                <div className="space-y-2">
                  {derived.equipmentEntries.map((entry, index) => {
                    const item = equipment.find((candidate) => candidate.id === entry.equipmentId)
                    return item ? (
                      <div key={`${entry.equipmentId}-${entry.source}-${index}`} className="border p-2 text-xs">
                        <p><strong>{item.nome}</strong> x{entry.quantity}</p>
                        <p className="text-muted-foreground">{entry.sourceLabel} | {entry.choiceLabel}</p>
                      </div>
                    ) : null
                  })}
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {derived.attacks.map((attack) => (
                    <div key={attack.name} className="border p-2 text-xs">
                      <p><strong>{attack.name}</strong> {formatModifier(attack.attackBonus)}</p>
                      <p>Dano: {attack.damage}</p>
                      <p>Alcance: {attack.range}</p>
                    </div>
                  ))}
                </div>
                <p><strong>Magias:</strong> {draft.selectedSpellIds.map((id) => spells.find((item) => item.id === id)).filter(Boolean).map((spell) => spellName(spell!, locale)).join(', ') || 'Nenhuma selecionada'}</p>
                {availableOrigins.length > 0 ? (
                  <p className="mt-2"><strong>{locale === 'en-US' ? 'Special cantrips:' : 'Truques especiais:'}</strong> {availableOrigins.map((origin) => {
                    const spell = spells.find((item) => item.id === origin.spellId)
                    return spell ? spellName(spell, locale) : null
                  }).filter(Boolean).join(', ')}</p>
                ) : null}
              </div>

              <div className="rounded-lg border p-3">
                <h4 className="mb-2 font-semibold">Caracteristicas</h4>
                <p className="text-xs"><strong>Recursos de classe:</strong> {derived.classFeatures.join(' | ') || 'Nenhum'}</p>
                <p className="mt-2 text-xs"><strong>Tracos raciais:</strong> {derived.racialTraits.join(' | ') || 'Nenhum'}</p>
                <p className="mt-2 text-xs"><strong>Idiomas:</strong> {derived.languages.join(', ') || 'Nenhum'}</p>
                <p className="mt-2 text-xs"><strong>Talentos:</strong> {draft.featIds.map((id) => feats.find((feat) => feat.id === id)?.nome).filter(Boolean).join(', ') || 'Nenhum'}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="border p-3">
                  <p className="font-semibold">PDF</p>
                  <p className="text-xs text-muted-foreground">Ficha em A4 com layout inspirado na ficha oficial.</p>
                </div>
                <div className="border p-3">
                  <p className="font-semibold">JSON</p>
                  <p className="text-xs text-muted-foreground">Exportacao estruturada para backup e reimportacao.</p>
                </div>
                <div className="border p-3">
                  <p className="font-semibold">Impressao</p>
                  <p className="text-xs text-muted-foreground">Acesso rapido para impressao da ficha.</p>
                </div>
              </div>
              <div className="border bg-muted/20 p-3 text-xs">
                <p><strong>Pronto para exportar:</strong> {draft.basicInfo.nome || 'Personagem sem nome'} | {selectedClass?.nome} nivel {draft.level}</p>
                <p><strong>Conteudo da ficha:</strong> atributos, resistencias, pericias, equipamentos, ataques, magias, idiomas, tracos raciais e recursos de classe.</p>
              </div>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <Stepper steps={wizardSteps} currentStep={currentStep} onStepSelect={setCurrentStep} />

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" onClick={prevStep} disabled={!canGoBack}>
              <ArrowLeft className="size-4" />
              {t('common.back')}
            </Button>
            <Button type="button" onClick={nextStep} disabled={!canGoNext}>
              {t('common.next')}
              <ArrowRight className="size-4" />
            </Button>
            <Button type="button" variant="outline" onClick={onSave} disabled={saving}>
              <Save className="size-4" />
              {saving ? t('builder.saving') : t('builder.saveIndexedDb')}
            </Button>
            <Button type="button" variant="outline" onClick={resetDraft}>
              <ScrollText className="size-4" />
              {t('builder.newCharacter')}
            </Button>
            <Button type="button" variant="outline" onClick={() => exportCharacterJson(draft)}>
              <Download className="size-4" />
              {t('common.exportJson')}
            </Button>
            <Button type="button" variant="outline" onClick={onExportPdf}>
              <FileDown className="size-4" />
              {t('common.exportPdf')}
            </Button>
            <Button type="button" variant="outline" onClick={printCharacterSheet}>
              <Printer className="size-4" />
              {t('common.print')}
            </Button>
            <Link to="/grimorio" className="inline-flex h-9 items-center justify-center rounded-sm border px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-muted/70">
              {t('builder.spellCompendiumLink')}
            </Link>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2 text-sm hover:bg-muted/70">
              <Upload className="size-4" />
              {t('common.importJson')}
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) {
                    void onImportFile(file)
                  }
                }}
              />
            </label>
            <Button type="button" variant="ghost" className="xl:hidden" onClick={() => setShowAssistantOnMobile(true)}>
              <Sparkles className="size-4" />
              {t('builder.mobileAssistant')}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('builder.savedCharacters')}</CardTitle>
              <CardDescription>
                {loadingSaved ? t('common.loading') : t('builder.localCharacters', { count: savedCharacters.length })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {savedCharacters.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('builder.noSavedCharacters')}</p>
              ) : (
                savedCharacters.map((character) => (
                  <div key={character.id} className="flex flex-wrap items-center justify-between gap-2 border p-2 text-sm">
                    <div>
                      <p className="font-semibold">{character.basicInfo.nome || 'Sem nome'}</p>
                      <p className="text-xs text-muted-foreground">
                        {getClassById(character.classId)?.nome} nivel {character.level}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline" onClick={() => loadCharacter(character)}>{t('builder.edit')}</Button>
                      <Button size="sm" variant="outline" onClick={() => void duplicateCharacterById(character.id)}>
                        <Copy className="size-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => void deleteCharacterById(character.id)}>
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <aside className="hidden space-y-4 xl:block">
          <AssistantPanel recommendations={recommendations} />
          <ComboPanel combo={selectedCombo} raceName={selectedRace?.nome} className={selectedClass?.nome} />
        </aside>
      </div>

      <Sheet
        open={showAssistantOnMobile}
        onClose={() => setShowAssistantOnMobile(false)}
        title={locale === 'en-US' ? 'Adventurer Assistant' : 'Assistente do Aventureiro'}
      >
        <div className="space-y-4">
          <AssistantPanel recommendations={recommendations} />
          <ComboPanel combo={selectedCombo} raceName={selectedRace?.nome} className={selectedClass?.nome} />
        </div>
      </Sheet>
    </div>
  )
}
