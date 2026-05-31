import { z } from 'zod'

import { defaultAttributeArray } from '@/data'

const validAttributeSet = [...defaultAttributeArray].sort((left, right) => left - right)

const baseAttributesSchema = z.object({
  for: z.number(),
  des: z.number(),
  con: z.number(),
  int: z.number(),
  sab: z.number(),
  car: z.number(),
}).refine((attributes) => {
  const values = Object.values(attributes).sort((left, right) => left - right)
  return values.length === validAttributeSet.length && values.every((value, index) => value === validAttributeSet[index])
}, 'Use cada valor do array padrao exatamente uma vez: 15, 14, 13, 12, 10 e 8.')

export const basicInfoSchema = z.object({
  nome: z.string().min(2, 'Informe um nome com pelo menos 2 caracteres.'),
  idade: z.string().min(1, 'Informe a idade.'),
  altura: z.string().min(1, 'Informe a altura.'),
  peso: z.string().min(1, 'Informe o peso.'),
  experiencia: z.string().min(1, 'Informe a experiencia.'),
  alinhamento: z.string().min(1, 'Selecione um alinhamento.'),
  idiomas: z.array(z.string()),
  historia: z.string().min(20, 'Escreva ao menos 20 caracteres de historia.'),
})

const persistedBasicInfoSchema = basicInfoSchema.extend({
  experiencia: z.string().default('0'),
})

export const characterSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  basicInfo: persistedBasicInfoSchema,
  raceId: z.string().min(1),
  classId: z.string().min(1),
  subclassId: z.string().default(''),
  backgroundId: z.string().min(1),
  level: z.number().min(1).max(20),
  featIds: z.array(z.string()),
  selectedSkills: z.array(z.string()),
  equipmentChoices: z.record(z.string(), z.string()).default({}),
  selectedEquipmentIds: z.array(z.string()).default([]),
  selectedSpellIds: z.array(z.string()).default([]),
  baseAttributes: baseAttributesSchema,
})

export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>
