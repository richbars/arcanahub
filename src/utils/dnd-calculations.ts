import {
  abilityLabels,
  backgrounds,
  backgroundEquipmentItems,
  classes,
  classEquipmentChoiceGroups,
  classFeatLevels,
  classSavingThrowProficiencies,
  defaultFeatLevels,
  equipment,
  fixedClassEquipment,
  races,
  racialLanguages,
  racialProficiencies,
  skills,
} from '@/data'
import type {
  AbilityKey,
  CharacterDraft,
  ClassData,
  DerivedAttack,
  DerivedStats,
  EquipmentChoiceGroup,
  EquipmentData,
  EquipmentEntry,
  EquipmentGrant,
  RaceData,
} from '@/types/dnd'

export const abilityOrder: AbilityKey[] = ['for', 'des', 'con', 'int', 'sab', 'car']

function skillIdByName(skillName: string): string | undefined {
  return skills.find((skill) => skill.nome === skillName)?.id
}

function resolveGrants(
  grants: EquipmentGrant[],
  source: EquipmentEntry['source'],
  sourceLabel: string,
  choiceLabel: string,
): EquipmentEntry[] {
  return grants.map((grant) => ({
    equipmentId: grant.equipmentId,
    quantity: grant.quantity,
    source,
    sourceLabel,
    choiceLabel,
  }))
}

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function proficiencyBonus(level: number): number {
  return 2 + Math.floor((level - 1) / 4)
}

export function getClassById(classId: string): ClassData | undefined {
  return classes.find((item) => item.id === classId)
}

export function getRaceById(raceId: string): RaceData | undefined {
  return races.find((item) => item.id === raceId)
}

export function getBackgroundById(backgroundId: string) {
  return backgrounds.find((item) => item.id === backgroundId)
}

export function getFeatSlotsForLevel(classId: string, level: number): number {
  const featLevels = classFeatLevels[classId] ?? defaultFeatLevels
  return featLevels.filter((featLevel) => featLevel <= level).length
}

export function getEquipmentChoiceGroups(draft: CharacterDraft): EquipmentChoiceGroup[] {
  const classGroups = classEquipmentChoiceGroups[draft.classId] ?? []
  const background = getBackgroundById(draft.backgroundId)

  const backgroundGroup = background && backgroundEquipmentItems[background.id]
    ? [{
        id: `background-${background.id}`,
        label: 'Equipamento do antecedente',
        description: 'Equipamento recebido pelo antecedente.',
        source: 'antecedente' as const,
        sourceId: background.id,
        sourceLabel: background.nome,
        choose: 1,
        options: [{
          id: background.id,
          label: background.nome,
          description: background.descricao,
          grants: backgroundEquipmentItems[background.id],
        }],
      }]
    : []

  return [...classGroups, ...backgroundGroup]
}

export function getAllEquipmentEntries(draft: CharacterDraft): EquipmentEntry[] {
  const entries: EquipmentEntry[] = []
  const choiceGroups = getEquipmentChoiceGroups(draft)

  for (const group of choiceGroups) {
    const selectedOptionId = draft.equipmentChoices[group.id] ?? group.options[0]?.id
    const selectedOption = group.options.find((option) => option.id === selectedOptionId) ?? group.options[0]

    if (selectedOption) {
      entries.push(...resolveGrants(selectedOption.grants, group.source, group.sourceLabel, selectedOption.label))
    }
  }

  const fixedEquipment = fixedClassEquipment[draft.classId] ?? []
  entries.push(...resolveGrants(fixedEquipment, 'classe', getClassById(draft.classId)?.nome ?? 'Classe', 'Equipamento fixo'))

  for (const equipmentId of draft.selectedEquipmentIds) {
    entries.push({
      equipmentId,
      quantity: 1,
      source: 'compra-inicial',
      sourceLabel: 'Compra inicial',
      choiceLabel: 'Selecionado manualmente',
    })
  }

  return entries
}

function expandEquipmentEntries(entries: EquipmentEntry[]): Array<EquipmentEntry & { item: EquipmentData }> {
  return entries.flatMap((entry) => {
    const item = equipment.find((candidate) => candidate.id === entry.equipmentId)
    if (!item) {
      return []
    }

    return [{ ...entry, item }]
  })
}

export function calculateFinalAttributes(draft: CharacterDraft): Record<AbilityKey, number> {
  const race = getRaceById(draft.raceId)
  const bonuses = race?.racialBonuses ?? {}

  return abilityOrder.reduce((acc, ability) => {
    acc[ability] = draft.baseAttributes[ability] + (bonuses[ability] ?? 0)
    return acc
  }, {} as Record<AbilityKey, number>)
}

function armorFromEquipment(itemIds: string[]): EquipmentData | undefined {
  return equipment.find((item) => itemIds.includes(item.id) && item.tipo === 'Armadura')
}

function hasShield(itemIds: string[]): boolean {
  return itemIds.includes('escudo')
}

function weaponAbilityModifier(item: EquipmentData, modifiers: Record<AbilityKey, number>) {
  if (item.isRanged) {
    return modifiers.des
  }

  if (item.isFinesse) {
    return Math.max(modifiers.for, modifiers.des)
  }

  return modifiers.for
}

function hasWeaponProficiency(item: EquipmentData, proficiencies: string[]) {
  if (proficiencies.includes(item.nome)) {
    return true
  }

  if (item.weaponGroup === 'simples' && proficiencies.some((entry) => entry.includes('Armas simples'))) {
    return true
  }

  if (item.weaponGroup === 'marcial' && proficiencies.some((entry) => entry.includes('Armas marciais') || entry.includes('simples e marciais'))) {
    return true
  }

  return false
}

export function calculateArmorClass(draft: CharacterDraft, modifiers: Record<AbilityKey, number>): number {
  const activeClass = getClassById(draft.classId)
  const itemIds = getAllEquipmentEntries(draft).map((entry) => entry.equipmentId)
  const armor = armorFromEquipment(itemIds)

  if (!armor && activeClass?.id === 'monge') {
    return 10 + modifiers.des + modifiers.sab
  }

  if (!armor && activeClass?.id === 'barbaro') {
    return 10 + modifiers.des + modifiers.con
  }

  let base = armor?.armorClass ?? 10

  if (armor?.tipo === 'Armadura') {
    if (typeof armor.dexCap === 'number') {
      base += Math.max(Math.min(modifiers.des, armor.dexCap), 0)
    } else {
      base += modifiers.des
    }
  } else {
    base += modifiers.des
  }

  if (hasShield(itemIds)) {
    base += 2
  }

  return base
}

export function calculateHp(draft: CharacterDraft, modifiers: Record<AbilityKey, number>): number {
  const activeClass = getClassById(draft.classId)
  if (!activeClass) {
    return 0
  }

  const level = draft.level
  const conMod = modifiers.con
  const firstLevel = activeClass.hitDie + conMod
  const averagePerLevel = Math.floor(activeClass.hitDie / 2) + 1 + conMod

  return Math.max(firstLevel + Math.max(level - 1, 0) * Math.max(averagePerLevel, 1), level)
}

export function calculateSpellSlots(classId: string, level: number): Record<number, number> {
  const fullCasters = ['bardo', 'clerigo', 'druida', 'feiticeiro', 'mago']
  const halfCasters = ['paladino', 'patrulheiro']

  if (!fullCasters.includes(classId) && !halfCasters.includes(classId) && classId !== 'bruxo') {
    return {}
  }

  if (classId === 'bruxo') {
    if (level <= 1) return { 1: 1 }
    if (level <= 2) return { 1: 2 }
    if (level <= 4) return { 2: 2 }
    if (level <= 6) return { 3: 2 }
    if (level <= 8) return { 4: 2 }
    if (level <= 10) return { 5: 2 }
    if (level <= 16) return { 5: 3 }
    return { 5: 4 }
  }

  const slotTable: Record<number, number[]> = {
    1: [2],
    2: [3],
    3: [4, 2],
    4: [4, 3],
    5: [4, 3, 2],
    6: [4, 3, 3],
    7: [4, 3, 3, 1],
    8: [4, 3, 3, 2],
    9: [4, 3, 3, 3, 1],
    10: [4, 3, 3, 3, 2],
    11: [4, 3, 3, 3, 2, 1],
    12: [4, 3, 3, 3, 2, 1],
    13: [4, 3, 3, 3, 2, 1, 1],
    14: [4, 3, 3, 3, 2, 1, 1],
    15: [4, 3, 3, 3, 2, 1, 1, 1],
    16: [4, 3, 3, 3, 2, 1, 1, 1],
    17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
    18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
    19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
    20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
  }

  const effectiveLevel = halfCasters.includes(classId)
    ? Math.max(Math.floor(level / 2), 1)
    : level

  const slots = slotTable[effectiveLevel] ?? []

  return Object.fromEntries(slots.map((value, index) => [index + 1, value]))
}

export function calculateSkillModifiers(
  draft: CharacterDraft,
  modifiers: Record<AbilityKey, number>,
): Record<string, number> {
  const profBonus = proficiencyBonus(draft.level)
  const backgroundSkillIds = (getBackgroundById(draft.backgroundId)?.pericias ?? [])
    .map(skillIdByName)
    .filter((skillId): skillId is string => Boolean(skillId))
  const proficientSkills = new Set([...backgroundSkillIds, ...draft.selectedSkills])

  return skills.reduce<Record<string, number>>((acc, skill) => {
    const base = modifiers[skill.ability]
    const prof = proficientSkills.has(skill.id) ? profBonus : 0
    acc[skill.id] = base + prof
    return acc
  }, {})
}

export function calculateSavingThrows(
  draft: CharacterDraft,
  modifiers: Record<AbilityKey, number>,
): Record<AbilityKey, number> {
  const saveProficiencies = new Set(classSavingThrowProficiencies[draft.classId] ?? [])
  const profBonus = proficiencyBonus(draft.level)

  return abilityOrder.reduce((acc, ability) => {
    acc[ability] = modifiers[ability] + (saveProficiencies.has(ability) ? profBonus : 0)
    return acc
  }, {} as Record<AbilityKey, number>)
}

export function calculateAttacks(
  draft: CharacterDraft,
  modifiers: Record<AbilityKey, number>,
  proficiencies: string[],
): DerivedAttack[] {
  return expandEquipmentEntries(getAllEquipmentEntries(draft))
    .filter((entry) => entry.item.tipo === 'Arma')
    .slice(0, 4)
    .map((entry) => {
      const abilityMod = weaponAbilityModifier(entry.item, modifiers)
      const proficient = hasWeaponProficiency(entry.item, proficiencies)
      const attackBonus = abilityMod + (proficient ? proficiencyBonus(draft.level) : 0)
      const notes = [...(entry.item.propriedades ?? [])]
      if (entry.quantity > 1) {
        notes.push(`Quantidade ${entry.quantity}`)
      }

      return {
        name: entry.item.nome,
        attackBonus,
        damage: `${entry.item.dano ?? '-'} ${formatModifier(abilityMod)}`,
        range: entry.item.alcance ?? 'Corpo a corpo',
        notes,
      }
    })
}

export function deriveStats(draft: CharacterDraft): DerivedStats {
  const atributosFinais = calculateFinalAttributes(draft)
  const modificadores = abilityOrder.reduce((acc, key) => {
    acc[key] = abilityModifier(atributosFinais[key])
    return acc
  }, {} as Record<AbilityKey, number>)
  const activeClass = getClassById(draft.classId)
  const activeRace = getRaceById(draft.raceId)
  const background = getBackgroundById(draft.backgroundId)
  const savingThrows = calculateSavingThrows(draft, modificadores)
  const skillModifiers = calculateSkillModifiers(draft, modificadores)
  const backgroundSkillIds = (background?.pericias ?? [])
    .map(skillIdByName)
    .filter((skillId): skillId is string => Boolean(skillId))
  const skillProficiencies = Array.from(new Set([...backgroundSkillIds, ...draft.selectedSkills]))
  const proficiencies = Array.from(new Set([
    ...(activeClass?.proficiencias ?? []),
    ...(background?.ferramentas ?? []),
    ...(racialProficiencies[draft.raceId] ?? []),
  ]))
  const attacks = calculateAttacks(draft, modificadores, proficiencies)
  const equipmentEntries = getAllEquipmentEntries(draft)
  const carryingWeight = expandEquipmentEntries(equipmentEntries)
    .reduce((total, entry) => total + (entry.item.peso * entry.quantity), 0)
  const spellcastingAbility = activeClass?.spellcastingAbility
  const spellAbilityMod = spellcastingAbility ? modificadores[spellcastingAbility] : null
  const classFeatures = Object.entries(activeClass?.progressionNotes ?? {})
    .map(([level, note]) => ({ level: Number(level), note }))
    .filter((entry) => entry.level <= draft.level)
    .sort((left, right) => left.level - right.level)
    .map((entry) => `Nivel ${entry.level}: ${entry.note}`)
  const racialTraits = activeRace?.vantagens ?? []
  const languages = Array.from(new Set([
    ...draft.basicInfo.idiomas,
    ...(racialLanguages[draft.raceId] ?? []),
    ...((background?.idiomas ?? []).filter((entry) => !entry.toLowerCase().includes('escolha'))),
  ]))

  return {
    atributosFinais,
    modificadores,
    proficiencyBonus: proficiencyBonus(draft.level),
    savingThrows,
    hp: calculateHp(draft, modificadores),
    ca: calculateArmorClass(draft, modificadores),
    iniciativa: modificadores.des,
    deslocamento: getRaceById(draft.raceId)?.deslocamento ?? 30,
    passivePerception: 10 + (skillModifiers.percepcao ?? modificadores.sab),
    skillModifiers,
    magicSlots: calculateSpellSlots(draft.classId, draft.level),
    spellSaveDC: spellAbilityMod === null ? null : 8 + proficiencyBonus(draft.level) + spellAbilityMod,
    spellAttackBonus: spellAbilityMod === null ? null : proficiencyBonus(draft.level) + spellAbilityMod,
    attacks,
    carryingWeight,
    featSlots: getFeatSlotsForLevel(draft.classId, draft.level),
    equipmentEntries,
    proficiencies,
    skillProficiencies,
    classFeatures,
    racialTraits,
    languages,
  }
}

export function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`
}

export function abilityLabel(ability: AbilityKey): string {
  return abilityLabels[ability]
}
