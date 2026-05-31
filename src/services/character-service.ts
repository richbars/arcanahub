import { deleteCharacterFromDb, listCharactersFromDb, saveCharacterToDb } from '@/services/db'
import type { CharacterDraft } from '@/types/dnd'

export async function createCharacter(character: CharacterDraft) {
  await saveCharacterToDb(character)
}

export async function updateCharacter(character: CharacterDraft) {
  await saveCharacterToDb(character)
}

export async function duplicateCharacter(character: CharacterDraft) {
  const cloned: CharacterDraft = {
    ...character,
    id: crypto.randomUUID(),
    basicInfo: {
      ...character.basicInfo,
      nome: `${character.basicInfo.nome} (Copia)`,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await saveCharacterToDb(cloned)
  return cloned
}

export async function deleteCharacter(id: string) {
  await deleteCharacterFromDb(id)
}

export async function listCharacters() {
  return listCharactersFromDb()
}
