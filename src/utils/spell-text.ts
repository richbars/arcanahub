import type { Locale, SpellData } from '@/types/dnd'

export function spellName(spell: SpellData, locale: Locale) {
  return locale === 'en-US' ? spell.nomeEn : spell.nome
}

export function spellType(spell: SpellData, locale: Locale) {
  return locale === 'en-US' ? spell.tipoEn : spell.tipo
}

export function spellSchool(spell: SpellData, locale: Locale) {
  return locale === 'en-US' ? spell.escolaEn : spell.escola
}

export function spellCastingTime(spell: SpellData, locale: Locale) {
  return locale === 'en-US' ? spell.tempoEn : spell.tempo
}

export function spellRange(spell: SpellData, locale: Locale) {
  return locale === 'en-US' ? spell.alcanceEn : spell.alcance
}

export function spellDuration(spell: SpellData, locale: Locale) {
  return locale === 'en-US' ? spell.duracaoEn : spell.duracao
}

export function spellDescription(spell: SpellData, locale: Locale) {
  return locale === 'en-US' ? spell.descricaoEn : spell.descricao
}

export function spellHigherLevels(spell: SpellData, locale: Locale) {
  return locale === 'en-US' ? spell.efeitosSuperioresEn : spell.efeitosSuperiores
}

export function spellSpecialRules(spell: SpellData, locale: Locale) {
  return locale === 'en-US' ? spell.regrasEspeciaisEn ?? [] : spell.regrasEspeciais ?? []
}

export function spellRestrictions(spell: SpellData, locale: Locale) {
  return locale === 'en-US' ? spell.restricoesEn ?? [] : spell.restricoes ?? []
}

export function spellInteractions(spell: SpellData, locale: Locale) {
  return locale === 'en-US' ? spell.interacoesEn ?? [] : spell.interacoes ?? []
}
