import { openDB } from 'idb'

import type { CharacterDraft } from '@/types/dnd'

const DB_NAME = 'dnd5e-character-builder'
const STORE_NAME = 'characters'

export const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
  },
})

export async function listCharactersFromDb(): Promise<CharacterDraft[]> {
  const db = await dbPromise
  return db.getAll(STORE_NAME)
}

export async function saveCharacterToDb(character: CharacterDraft) {
  const db = await dbPromise
  await db.put(STORE_NAME, character)
}

export async function deleteCharacterFromDb(id: string) {
  const db = await dbPromise
  await db.delete(STORE_NAME, id)
}

export async function getCharacterFromDb(id: string): Promise<CharacterDraft | undefined> {
  const db = await dbPromise
  return db.get(STORE_NAME, id)
}
