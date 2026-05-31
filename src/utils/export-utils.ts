import jsPDF from 'jspdf'

import { backgrounds, equipment, feats, skills, spells, subclasses } from '@/data'
import { abilityLabel, formatModifier, getClassById, getRaceById } from '@/utils/dnd-calculations'
import type { CharacterDraft, DerivedStats } from '@/types/dnd'

export function exportCharacterJson(character: CharacterDraft) {
  const { subclassId, ...rest } = character
  const exportPayload = {
    ...rest,
    archetypeId: subclassId,
  }
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${character.basicInfo.nome || 'personagem'}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

function drawLabeledBox(pdf: jsPDF, x: number, y: number, width: number, height: number, label: string, value: string) {
  pdf.roundedRect(x, y, width, height, 1.5, 1.5)
  pdf.setFontSize(7)
  pdf.text(label.toUpperCase(), x + 2, y + 4)
  pdf.setFontSize(11)
  const lines = pdf.splitTextToSize(value || '-', width - 4)
  pdf.text(lines.slice(0, 3), x + 2, y + 10)
}

function drawSectionTitle(pdf: jsPDF, x: number, y: number, title: string) {
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.text(title.toUpperCase(), x, y)
  pdf.setFont('helvetica', 'normal')
}

function drawAbilityColumn(pdf: jsPDF, x: number, y: number, label: string, score: number, modifier: number) {
  pdf.roundedRect(x, y, 24, 22, 2, 2)
  pdf.setFontSize(7)
  pdf.text(label.toUpperCase(), x + 12, y + 4, { align: 'center' })
  pdf.setFontSize(16)
  pdf.text(String(score), x + 12, y + 11, { align: 'center' })
  pdf.setFontSize(9)
  pdf.roundedRect(x + 5, y + 14, 14, 6, 1.5, 1.5)
  pdf.text(formatModifier(modifier), x + 12, y + 18, { align: 'center' })
}

function drawBulletParagraph(pdf: jsPDF, x: number, y: number, width: number, title: string, lines: string[]) {
  drawSectionTitle(pdf, x, y, title)
  pdf.roundedRect(x, y + 2, width, 28, 1.5, 1.5)
  pdf.setFontSize(7)
  const content = lines.length > 0 ? lines.join(' | ') : '-'
  const wrapped = pdf.splitTextToSize(content, width - 4)
  pdf.text(wrapped.slice(0, 10), x + 2, y + 7)
}

export async function exportCharacterPdf(character: CharacterDraft, derived: DerivedStats) {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const activeClass = getClassById(character.classId)
  const activeRace = getRaceById(character.raceId)
  const activeBackground = backgrounds.find((background) => background.id === character.backgroundId)
  const activeArchetype = subclasses.find((subclass) => subclass.id === character.subclassId)
  const featNames = character.featIds.map((id) => feats.find((feat) => feat.id === id)?.nome).filter(Boolean) as string[]
  const spellNames = character.selectedSpellIds.map((id) => spells.find((spell) => spell.id === id)?.nome).filter(Boolean) as string[]
  const equipmentNames = derived.equipmentEntries.map((entry) => {
    const item = equipment.find((candidate) => candidate.id === entry.equipmentId)
    return item ? `${item.nome} x${entry.quantity} (${entry.sourceLabel})` : null
  }).filter(Boolean) as string[]

  pdf.setDrawColor(84, 69, 54)
  pdf.setTextColor(30, 27, 24)
  pdf.setFont('helvetica', 'normal')

  drawLabeledBox(pdf, 8, 8, 74, 16, 'Nome do personagem', character.basicInfo.nome || 'Sem nome')
  drawLabeledBox(pdf, 84, 8, 54, 16, 'Classe, arquétipo e nivel', `${activeClass?.nome ?? '-'} ${activeArchetype ? `/ ${activeArchetype.nome}` : ''} / Nivel ${character.level}`)
  drawLabeledBox(pdf, 140, 8, 30, 16, 'Antecedente', activeBackground?.nome ?? '-')
  drawLabeledBox(pdf, 172, 8, 30, 16, 'Raca', activeRace?.nome ?? '-')

  drawLabeledBox(pdf, 8, 26, 30, 14, 'Alinhamento', character.basicInfo.alinhamento)
  drawLabeledBox(pdf, 40, 26, 30, 14, 'Experiencia', character.basicInfo.experiencia || '0')
  drawLabeledBox(pdf, 72, 26, 30, 14, 'Bonus de proficiencia', formatModifier(derived.proficiencyBonus))
  drawLabeledBox(pdf, 104, 26, 22, 14, 'CA', String(derived.ca))
  drawLabeledBox(pdf, 128, 26, 22, 14, 'Iniciativa', formatModifier(derived.iniciativa))
  drawLabeledBox(pdf, 152, 26, 22, 14, 'Deslocamento', `${derived.deslocamento} pes`)
  drawLabeledBox(pdf, 176, 26, 26, 14, 'PV max.', String(derived.hp))

  const abilityStartY = 46
  ;(['for', 'des', 'con', 'int', 'sab', 'car'] as const).forEach((ability, index) => {
    drawAbilityColumn(pdf, 8, abilityStartY + (index * 24), abilityLabel(ability), derived.atributosFinais[ability], derived.modificadores[ability])
  })

  drawSectionTitle(pdf, 36, 47, 'Testes de resistencia')
  pdf.roundedRect(36, 49, 48, 44, 1.5, 1.5)
  pdf.setFontSize(8)
  ;(['for', 'des', 'con', 'int', 'sab', 'car'] as const).forEach((ability, index) => {
    pdf.text(`${abilityLabel(ability)} ${formatModifier(derived.savingThrows[ability])}`, 39, 55 + (index * 6))
  })

  drawSectionTitle(pdf, 86, 47, 'Pericias')
  pdf.roundedRect(86, 49, 56, 88, 1.5, 1.5)
  pdf.setFontSize(7)
  skills.forEach((skill, index) => {
    const trained = derived.skillProficiencies.includes(skill.id) ? '●' : '○'
    pdf.text(`${trained} ${skill.nome} ${formatModifier(derived.skillModifiers[skill.id] ?? 0)}`, 89, 55 + (index * 4.5))
  })

  drawSectionTitle(pdf, 144, 47, 'Combate')
  pdf.roundedRect(144, 49, 58, 44, 1.5, 1.5)
  pdf.setFontSize(8)
  pdf.text(`PV atual: ${derived.hp}`, 147, 56)
  pdf.text(`Dados de vida: d${activeClass?.hitDie ?? '-'}`, 147, 62)
  pdf.text(`Percepcao passiva: ${derived.passivePerception}`, 147, 68)
  pdf.text(`Ataque magia: ${derived.spellAttackBonus === null ? '-' : formatModifier(derived.spellAttackBonus)}`, 147, 74)
  pdf.text(`CD magia: ${derived.spellSaveDC ?? '-'}`, 147, 80)
  pdf.text(`Carga: ${derived.carryingWeight.toFixed(1)} lb`, 147, 86)

  drawSectionTitle(pdf, 36, 100, 'Ataques')
  pdf.roundedRect(36, 102, 166, 28, 1.5, 1.5)
  pdf.setFontSize(7)
  derived.attacks.slice(0, 3).forEach((attack, index) => {
    const line = `${attack.name}: ${formatModifier(attack.attackBonus)} | ${attack.damage} | ${attack.range}`
    pdf.text(line, 39, 108 + (index * 7))
  })

  drawBulletParagraph(pdf, 8, 194, 94, 'Equipamentos', equipmentNames)
  drawBulletParagraph(pdf, 108, 194, 94, 'Magias', spellNames)
  drawBulletParagraph(pdf, 8, 226, 94, 'Recursos de classe', derived.classFeatures)
  drawBulletParagraph(pdf, 108, 226, 94, 'Tracos e talentos', [...derived.racialTraits, ...featNames])
  drawBulletParagraph(pdf, 8, 258, 194, 'Idiomas e historia', [...derived.languages, character.basicInfo.historia])

  pdf.save(`${character.basicInfo.nome || 'personagem'}-ficha.pdf`)
}

export function printCharacterSheet() {
  window.print()
}

export function importCharacterFromJson(file: File): Promise<CharacterDraft> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result)) as CharacterDraft & { archetypeId?: string }
        const parsed = {
          ...raw,
          subclassId: raw.subclassId ?? raw.archetypeId ?? '',
        } as CharacterDraft
        resolve(parsed)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(reader.error)
    }

    reader.readAsText(file)
  })
}

export function toSummaryExport(character: CharacterDraft, derived: DerivedStats) {
  const { subclassId, ...rest } = character
  return {
    ...rest,
    archetypeId: subclassId,
    derived,
  }
}
