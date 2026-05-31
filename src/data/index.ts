import backgroundsJson from '@/data/backgrounds.json'
import classesJson from '@/data/classes.json'
import combosJson from '@/data/combos.json'
import featsJson from '@/data/feats.json'
import racesJson from '@/data/races.json'
import { equipmentCatalog } from '@/data/equipment-catalog'
import {
  backgroundEquipmentItems,
  classEquipmentChoiceGroups,
  classFeatLevels,
  classSavingThrowProficiencies,
  defaultFeatLevels,
  fixedClassEquipment,
  racialLanguages,
  racialProficiencies,
} from '@/data/rules'
import skillsJson from '@/data/skills.json'
import { magicalOrigins, spellCompendium } from '@/data/spell-compendium'
import subclassesJson from '@/data/subclasses.json'
import type {
  BackgroundData,
  ClassData,
  ComboData,
  EquipmentData,
  FeatData,
  MagicalOriginData,
  RaceData,
  SkillData,
  SpellData,
  SubclassData,
} from '@/types/dnd'

export const races = racesJson as unknown as RaceData[]
export const classes = classesJson as unknown as ClassData[]
export const subclasses = subclassesJson as unknown as SubclassData[]
export const backgrounds = backgroundsJson as unknown as BackgroundData[]
export const skills = skillsJson as unknown as SkillData[]
export const equipment = equipmentCatalog as EquipmentData[]
export const spells = spellCompendium as SpellData[]
export const spellOrigins = magicalOrigins as MagicalOriginData[]
export const feats = featsJson as unknown as FeatData[]
export const combos = combosJson as unknown as ComboData[]
export {
  backgroundEquipmentItems,
  classEquipmentChoiceGroups,
  classFeatLevels,
  classSavingThrowProficiencies,
  defaultFeatLevels,
  fixedClassEquipment,
  racialLanguages,
  racialProficiencies,
}

export const abilityLabels: Record<string, string> = {
  for: 'Forca',
  des: 'Destreza',
  con: 'Constituicao',
  int: 'Inteligencia',
  sab: 'Sabedoria',
  car: 'Carisma',
}

export const defaultAttributeArray = [15, 14, 13, 12, 10, 8]

export const alignments = [
  'Leal e Bom',
  'Neutro e Bom',
  'Caotico e Bom',
  'Leal e Neutro',
  'Neutro',
  'Caotico e Neutro',
  'Leal e Mau',
  'Neutro e Mau',
  'Caotico e Mau',
] as const
