export type AbilityKey = 'for' | 'des' | 'con' | 'int' | 'sab' | 'car'
export type EquipmentSource = 'classe' | 'antecedente' | 'raca' | 'compra-inicial'
export type Locale = 'pt-BR' | 'en-US'

export type Alignment =
  | 'Leal e Bom'
  | 'Neutro e Bom'
  | 'Caotico e Bom'
  | 'Leal e Neutro'
  | 'Neutro'
  | 'Caotico e Neutro'
  | 'Leal e Mau'
  | 'Neutro e Mau'
  | 'Caotico e Mau'

export type Role = 'Tank' | 'Suporte' | 'Dano' | 'Controle' | 'Curandeiro'

export interface RaceData {
  id: string
  nome: string
  descricao: string
  vantagens: string[]
  desvantagens: string[]
  lore: string
  dicas: string[]
  deslocamento: number
  racialBonuses: Partial<Record<AbilityKey, number>>
}

export interface ClassData {
  id: string
  nome: string
  descricao: string
  role: Role[]
  pontosFortes: string[]
  pontosFracos: string[]
  complexidade: 1 | 2 | 3
  hitDie: number
  proficiencias: string[]
  equipamentosIniciais: string[]
  periciasEscolha: {
    quantidade: number
    opcoes: string[]
  }
  primaryAbilities: AbilityKey[]
  spellcastingAbility?: AbilityKey
  conjurador: boolean
  progressionNotes: Record<string, string>
}

export interface SubclassData {
  id: string
  classId: string
  nome: string
  descricao: string
  nivelDesbloqueio: number
}

export interface BackgroundData {
  id: string
  nome: string
  pericias: string[]
  idiomas: string[]
  ferramentas: string[]
  descricao: string
}

export interface SkillData {
  id: string
  nome: string
  ability: AbilityKey
  descricao: string
}

export interface EquipmentData {
  id: string
  nome: string
  tipo: 'Arma' | 'Armadura' | 'Escudo' | 'Item'
  categoria: string
  descricao: string
  dano?: string
  alcance?: string
  propriedades?: string[]
  peso: number
  armorClass?: number
  dexCap?: number
  weaponGroup?: 'simples' | 'marcial'
  armorCategory?: 'leve' | 'media' | 'pesada' | 'escudo'
  isFinesse?: boolean
  isRanged?: boolean
}

export interface EquipmentGrant {
  equipmentId: string
  quantity: number
}

export interface EquipmentChoiceOption {
  id: string
  label: string
  description: string
  grants: EquipmentGrant[]
}

export interface EquipmentChoiceGroup {
  id: string
  label: string
  description: string
  source: EquipmentSource
  sourceId: string
  sourceLabel: string
  choose: number
  options: EquipmentChoiceOption[]
}

export interface EquipmentEntry {
  equipmentId: string
  quantity: number
  source: EquipmentSource
  sourceLabel: string
  choiceLabel: string
}

export interface SpellData {
  id: string
  nome: string
  nomeEn: string
  classeIds: string[]
  nivel: number
  escola: string
  escolaEn: string
  tempo: string
  tempoEn: string
  alcance: string
  alcanceEn: string
  componentes: string
  duracao: string
  duracaoEn: string
  ritual: boolean
  concentracao: boolean
  tipo: 'Truque' | 'Magia'
  tipoEn: 'Cantrip' | 'Spell'
  descricao: string
  descricaoEn: string
  efeitosSuperiores?: string
  efeitosSuperioresEn?: string
  regrasEspeciais?: string[]
  regrasEspeciaisEn?: string[]
  restricoes?: string[]
  restricoesEn?: string[]
  interacoes?: string[]
  interacoesEn?: string[]
  exemplosUso: string[]
  exemplosUsoEn: string[]
  estrategias: string[]
  estrategiasEn: string[]
  dicas: string[]
  dicasEn: string[]
}

export interface MagicalOriginData {
  id: string
  spellId: string
  originType: 'race' | 'class'
  originId: string
  originName: string
  originNameEn: string
  requirement: string
  requirementEn: string
  scaling: string
  scalingEn: string
}

export interface FeatData {
  id: string
  nome: string
  requisitos: string[]
  beneficios: string[]
  combos: string[]
}

export interface ComboData {
  raceId: string
  classId: string
  nota: number
  motivo: string
}

export interface BasicInfo {
  nome: string
  idade: string
  altura: string
  peso: string
  experiencia: string
  alinhamento: string
  idiomas: string[]
  historia: string
}

export interface CharacterDraft {
  id: string
  createdAt: string
  updatedAt: string
  basicInfo: BasicInfo
  raceId: string
  classId: string
  subclassId: string
  backgroundId: string
  level: number
  featIds: string[]
  selectedSkills: string[]
  equipmentChoices: Record<string, string>
  selectedEquipmentIds: string[]
  selectedSpellIds: string[]
  baseAttributes: Record<AbilityKey, number>
}

export interface DerivedAttack {
  name: string
  attackBonus: number
  damage: string
  range: string
  notes: string[]
}

export interface DerivedStats {
  atributosFinais: Record<AbilityKey, number>
  modificadores: Record<AbilityKey, number>
  proficiencyBonus: number
  savingThrows: Record<AbilityKey, number>
  hp: number
  ca: number
  iniciativa: number
  deslocamento: number
  passivePerception: number
  skillModifiers: Record<string, number>
  magicSlots: Record<number, number>
  spellSaveDC: number | null
  spellAttackBonus: number | null
  attacks: DerivedAttack[]
  carryingWeight: number
  featSlots: number
  equipmentEntries: EquipmentEntry[]
  proficiencies: string[]
  skillProficiencies: string[]
  classFeatures: string[]
  racialTraits: string[]
  languages: string[]
}
