import { create } from 'zustand'

import { classes, classFeatLevels, defaultAttributeArray, defaultFeatLevels } from '@/data'
import { characterSchema } from '@/schemas/character-schema'
import { createCharacter, deleteCharacter, duplicateCharacter, listCharacters, updateCharacter } from '@/services/character-service'
import type { AbilityKey, BasicInfo, CharacterDraft } from '@/types/dnd'

const defaultBasicInfo: BasicInfo = {
  nome: '',
  idade: '',
  altura: '',
  peso: '',
  experiencia: '0',
  alinhamento: 'Neutro',
  idiomas: [],
  historia: '',
}

function normalizeCharacterDraft(character: CharacterDraft): CharacterDraft {
  return characterSchema.parse(character)
}

function emptyAttributes(): Record<AbilityKey, number> {
  return {
    for: defaultAttributeArray[0],
    des: defaultAttributeArray[1],
    con: defaultAttributeArray[2],
    int: defaultAttributeArray[3],
    sab: defaultAttributeArray[4],
    car: defaultAttributeArray[5],
  }
}

function swapAttributeValue(
  attributes: Record<AbilityKey, number>,
  ability: AbilityKey,
  value: number,
): Record<AbilityKey, number> {
  const currentAbility = Object.entries(attributes).find(([, score]) => score === value)?.[0] as AbilityKey | undefined
  const next = { ...attributes }

  if (currentAbility && currentAbility !== ability) {
    next[currentAbility] = attributes[ability]
  }

  next[ability] = value
  return next
}

function createDefaultCharacter(): CharacterDraft {
  const now = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    basicInfo: defaultBasicInfo,
    raceId: 'humano',
    classId: classes[0]?.id ?? 'guerreiro',
    subclassId: '',
    backgroundId: 'soldado',
    level: 1,
    featIds: [],
    selectedSkills: [],
    equipmentChoices: {},
    selectedEquipmentIds: [],
    selectedSpellIds: [],
    baseAttributes: emptyAttributes(),
  }
}

function featSlotsForCharacter(character: CharacterDraft): number {
  const levels = classFeatLevels[character.classId] ?? defaultFeatLevels
  return levels.filter((level) => level <= character.level).length
}

interface CharacterStore {
  currentStep: number
  draft: CharacterDraft
  savedCharacters: CharacterDraft[]
  loadingSaved: boolean
  setCurrentStep: (value: number) => void
  resetDraft: () => void
  updateDraft: (patch: Partial<CharacterDraft>) => void
  updateBasicInfo: (patch: Partial<BasicInfo>) => void
  setAttribute: (ability: AbilityKey, value: number) => void
  setSelectedSkills: (skills: string[]) => void
  setEquipmentChoice: (groupId: string, optionId: string) => void
  setSelectedEquipment: (equipmentIds: string[]) => void
  setSelectedSpells: (spellIds: string[]) => void
  toggleFeat: (featId: string) => void
  saveCurrent: () => Promise<void>
  loadSaved: () => Promise<void>
  loadCharacter: (character: CharacterDraft) => void
  duplicateCharacterById: (id: string) => Promise<void>
  deleteCharacterById: (id: string) => Promise<void>
  importCharacter: (character: CharacterDraft) => Promise<void>
}

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  currentStep: 1,
  draft: createDefaultCharacter(),
  savedCharacters: [],
  loadingSaved: false,
  setCurrentStep: (value) => set({ currentStep: value }),
  resetDraft: () => set({ draft: createDefaultCharacter(), currentStep: 1 }),
  updateDraft: (patch) =>
    set((state) => ({
      draft: {
        ...state.draft,
        ...patch,
        updatedAt: new Date().toISOString(),
      },
    })),
  updateBasicInfo: (patch) =>
    set((state) => ({
      draft: {
        ...state.draft,
        basicInfo: {
          ...state.draft.basicInfo,
          ...patch,
        },
        updatedAt: new Date().toISOString(),
      },
    })),
  setAttribute: (ability, value) =>
    set((state) => ({
      draft: {
        ...state.draft,
        baseAttributes: swapAttributeValue(state.draft.baseAttributes, ability, value),
        updatedAt: new Date().toISOString(),
      },
    })),
  setSelectedSkills: (skills) =>
    set((state) => ({
      draft: {
        ...state.draft,
        selectedSkills: skills,
        updatedAt: new Date().toISOString(),
      },
    })),
  setEquipmentChoice: (groupId, optionId) =>
    set((state) => ({
      draft: {
        ...state.draft,
        equipmentChoices: {
          ...state.draft.equipmentChoices,
          [groupId]: optionId,
        },
        updatedAt: new Date().toISOString(),
      },
    })),
  setSelectedEquipment: (equipmentIds) =>
    set((state) => ({
      draft: {
        ...state.draft,
        selectedEquipmentIds: equipmentIds,
        updatedAt: new Date().toISOString(),
      },
    })),
  setSelectedSpells: (spellIds) =>
    set((state) => ({
      draft: {
        ...state.draft,
        selectedSpellIds: spellIds,
        updatedAt: new Date().toISOString(),
      },
    })),
  toggleFeat: (featId) =>
    set((state) => {
      const has = state.draft.featIds.includes(featId)
      const featSlots = featSlotsForCharacter(state.draft)
      const nextFeatIds = has
        ? state.draft.featIds.filter((id) => id !== featId)
        : state.draft.featIds.length < featSlots
          ? [...state.draft.featIds, featId]
          : state.draft.featIds

      return {
        draft: {
          ...state.draft,
          featIds: nextFeatIds,
          updatedAt: new Date().toISOString(),
        },
      }
    }),
  saveCurrent: async () => {
    const current = get().draft
    const parsed = characterSchema.parse(current)
    const exists = get().savedCharacters.some((item) => item.id === parsed.id)

    if (exists) {
      await updateCharacter(parsed)
    } else {
      await createCharacter(parsed)
    }

    await get().loadSaved()
  },
  loadSaved: async () => {
    set({ loadingSaved: true })
    const chars = await listCharacters()
    set({ savedCharacters: chars.map(normalizeCharacterDraft), loadingSaved: false })
  },
  loadCharacter: (character) =>
    set({
      draft: {
        ...normalizeCharacterDraft(character),
        updatedAt: new Date().toISOString(),
      },
      currentStep: 1,
    }),
  duplicateCharacterById: async (id) => {
    const source = get().savedCharacters.find((item) => item.id === id)
    if (!source) {
      return
    }

    await duplicateCharacter(source)
    await get().loadSaved()
  },
  deleteCharacterById: async (id) => {
    await deleteCharacter(id)
    await get().loadSaved()
  },
  importCharacter: async (character) => {
    const parsed = characterSchema.parse({
      ...character,
      id: character.id || crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
      createdAt: character.createdAt || new Date().toISOString(),
    })

    await createCharacter(parsed)
    set({ draft: parsed, currentStep: 1 })
    await get().loadSaved()
  },
}))
