import type { AbilityKey, EquipmentChoiceGroup, EquipmentGrant, EquipmentSource } from '@/types/dnd'

function grant(equipmentId: string, quantity = 1): EquipmentGrant {
  return { equipmentId, quantity }
}

function group(
  id: string,
  label: string,
  description: string,
  source: EquipmentSource,
  sourceId: string,
  sourceLabel: string,
  options: EquipmentChoiceGroup['options'],
): EquipmentChoiceGroup {
  return {
    id,
    label,
    description,
    source,
    sourceId,
    sourceLabel,
    choose: 1,
    options,
  }
}

export const classSavingThrowProficiencies: Record<string, AbilityKey[]> = {
  barbaro: ['for', 'con'],
  bardo: ['des', 'car'],
  bruxo: ['sab', 'car'],
  clerigo: ['sab', 'car'],
  druida: ['int', 'sab'],
  feiticeiro: ['con', 'car'],
  guerreiro: ['for', 'con'],
  ladino: ['des', 'int'],
  mago: ['int', 'sab'],
  monge: ['for', 'des'],
  paladino: ['sab', 'car'],
  patrulheiro: ['for', 'des'],
}

export const classFeatLevels: Record<string, number[]> = {
  guerreiro: [4, 6, 8, 12, 14, 16, 19],
  ladino: [4, 8, 10, 12, 16, 19],
}

export const defaultFeatLevels = [4, 8, 12, 16, 19]

export const racialLanguages: Record<string, string[]> = {
  humano: ['Comum'],
  anao: ['Comum', 'Anao'],
  elfo: ['Comum', 'Elfico'],
  halfling: ['Comum', 'Halfling'],
  draconato: ['Comum', 'Draconico'],
  gnomo: ['Comum', 'Gnomico'],
  'meio-elfo': ['Comum', 'Elfico'],
  'meio-orc': ['Comum', 'Orc'],
  tiefling: ['Comum', 'Infernal'],
}

export const racialProficiencies: Record<string, string[]> = {
  anao: ['Machadinha', 'Martelo Leve', 'Machado Grande', 'Martelo de Guerra'],
  elfo: ['Espada Longa', 'Espada Curta', 'Arco Curto', 'Arco Longo'],
}

export const classEquipmentChoiceGroups: Record<string, EquipmentChoiceGroup[]> = {
  barbaro: [
    group('barbaro-arma-principal', 'Arma principal', 'Escolha o armamento principal inicial do barbaro.', 'classe', 'barbaro', 'Barbaro', [
      { id: 'greataxe', label: 'Machado grande', description: 'A opcao classica do barbaro.', grants: [grant('machado-grande')] },
      { id: 'martial-melee', label: 'Espada longa', description: 'Alternativa marcial corpo a corpo.', grants: [grant('espada-longa')] },
      { id: 'martial-hammer', label: 'Martelo de guerra', description: 'Alternativa marcial contundente.', grants: [grant('martelo-guerra')] },
    ]),
    group('barbaro-secundaria', 'Arma secundaria', 'Escolha a opcao secundaria inicial.', 'classe', 'barbaro', 'Barbaro', [
      { id: 'handaxes', label: 'Duas machadinhas', description: 'Melhor para arremesso e combate rapido.', grants: [grant('machadinha', 2)] },
      { id: 'spear', label: 'Lanca', description: 'Arma simples corpo a corpo.', grants: [grant('lanca')] },
      { id: 'mace', label: 'Maca', description: 'Arma simples contundente.', grants: [grant('maca')] },
    ]),
    group('barbaro-pacote', 'Pacote de exploracao', 'Equipamento geral de viagem.', 'classe', 'barbaro', 'Barbaro', [
      { id: 'explorer', label: 'Pacote de explorador', description: 'Kit padrao do barbaro.', grants: [grant('pacote-explorador'), grant('azagaia', 4)] },
    ]),
  ],
  bardo: [
    group('bardo-arma', 'Arma inicial', 'Escolha a arma do bardo.', 'classe', 'bardo', 'Bardo', [
      { id: 'rapier', label: 'Rapieira', description: 'Acuidade e dano consistente.', grants: [grant('rapieira')] },
      { id: 'longsword', label: 'Espada longa', description: 'Alternativa versatil.', grants: [grant('espada-longa')] },
      { id: 'dagger', label: 'Adaga', description: 'Opcao simples e discreta.', grants: [grant('adaga')] },
    ]),
    group('bardo-pacote', 'Pacote inicial', 'Escolha o pacote do bardo.', 'classe', 'bardo', 'Bardo', [
      { id: 'diplomat', label: 'Pacote de diplomata', description: 'Voltado para interacao social.', grants: [grant('pacote-diplomata')] },
      { id: 'artist', label: 'Pacote de artista', description: 'Ideal para performances e viagens.', grants: [grant('pacote-artista')] },
    ]),
    group('bardo-instrumento', 'Instrumento musical', 'Escolha um instrumento musical.', 'classe', 'bardo', 'Bardo', [
      { id: 'instrument', label: 'Instrumento musical', description: 'Instrumento a escolha do personagem.', grants: [grant('instrumento-musical')] },
    ]),
  ],
  bruxo: [
    group('bruxo-arma', 'Arma inicial', 'Escolha entre arma simples ou besta.', 'classe', 'bruxo', 'Bruxo', [
      { id: 'crossbow', label: 'Besta leve e 20 virotes', description: 'O pacote mais comum do bruxo.', grants: [grant('besta-leve'), grant('virotes-20')] },
      { id: 'mace', label: 'Maca', description: 'Alternativa simples corpo a corpo.', grants: [grant('maca')] },
      { id: 'dagger', label: 'Adaga', description: 'Alternativa leve e discreta.', grants: [grant('adaga')] },
    ]),
    group('bruxo-foco', 'Foco de conjuracao', 'Escolha como lancar magias.', 'classe', 'bruxo', 'Bruxo', [
      { id: 'pouch', label: 'Bolsa de componentes', description: 'Bolsa com componentes materiais.', grants: [grant('bolsa-componentes')] },
      { id: 'focus', label: 'Foco arcano', description: 'Foco para conjuracao.', grants: [grant('foco-arcano')] },
    ]),
    group('bruxo-pacote', 'Pacote inicial', 'Escolha seu pacote de viagem.', 'classe', 'bruxo', 'Bruxo', [
      { id: 'scholar', label: 'Pacote de estudioso', description: 'Melhor para pesquisa e tomos.', grants: [grant('pacote-estudioso')] },
      { id: 'dungeon', label: 'Pacote de masmorra', description: 'Melhor para exploracao hostil.', grants: [grant('pacote-masmorra')] },
    ]),
  ],
  clerigo: [
    group('clerigo-arma', 'Arma inicial', 'Escolha sua arma principal.', 'classe', 'clerigo', 'Clerigo', [
      { id: 'mace', label: 'Maca', description: 'Arma simples classica de clerigos.', grants: [grant('maca')] },
      { id: 'warhammer', label: 'Martelo de guerra', description: 'Opcao para dominios ou conceitos marciais.', grants: [grant('martelo-guerra')] },
    ]),
    group('clerigo-armadura', 'Armadura inicial', 'Escolha sua armadura inicial.', 'classe', 'clerigo', 'Clerigo', [
      { id: 'scale', label: 'Armadura de escamas', description: 'Melhor defesa base.', grants: [grant('armadura-escamas')] },
      { id: 'leather', label: 'Armadura de couro', description: 'Opcao mais leve.', grants: [grant('armadura-couro')] },
      { id: 'chain', label: 'Cota de malha', description: 'Opcao pesada para conceitos mais defensivos.', grants: [grant('cota-de-malha')] },
    ]),
    group('clerigo-secundaria', 'Arma secundaria', 'Escolha sua segunda opcao de combate.', 'classe', 'clerigo', 'Clerigo', [
      { id: 'crossbow', label: 'Besta leve e 20 virotes', description: 'Ataque a distancia util.', grants: [grant('besta-leve'), grant('virotes-20')] },
      { id: 'spear', label: 'Lanca', description: 'Alternativa simples corpo a corpo.', grants: [grant('lanca')] },
    ]),
    group('clerigo-pacote', 'Pacote inicial', 'Escolha seu pacote.', 'classe', 'clerigo', 'Clerigo', [
      { id: 'priest', label: 'Pacote de sacerdote', description: 'Voltado para servico religioso.', grants: [grant('pacote-sacerdote')] },
      { id: 'explorer', label: 'Pacote de explorador', description: 'Melhor para aventura em campo.', grants: [grant('pacote-explorador')] },
    ]),
  ],
  druida: [
    group('druida-primeira', 'Protecao inicial', 'Escolha a primeira opcao do druida.', 'classe', 'druida', 'Druida', [
      { id: 'shield', label: 'Escudo', description: 'Escudo simples de madeira.', grants: [grant('escudo')] },
      { id: 'club', label: 'Clava', description: 'Arma simples corpo a corpo.', grants: [grant('clava')] },
      { id: 'staff', label: 'Bordao', description: 'Arma simples versatil.', grants: [grant('bordao')] },
    ]),
    group('druida-segunda', 'Arma inicial', 'Escolha a segunda opcao do druida.', 'classe', 'druida', 'Druida', [
      { id: 'scimitar', label: 'Cimitarra', description: 'Arma tradicional de druidas.', grants: [grant('foice-curta')] },
      { id: 'spear', label: 'Lanca', description: 'Alternativa simples.', grants: [grant('lanca')] },
      { id: 'mace', label: 'Maca', description: 'Alternativa contundente.', grants: [grant('maca')] },
    ]),
  ],
  feiticeiro: [
    group('feiticeiro-arma', 'Arma inicial', 'Escolha seu armamento.', 'classe', 'feiticeiro', 'Feiticeiro', [
      { id: 'crossbow', label: 'Besta leve e 20 virotes', description: 'Alternativa de ataque a distancia.', grants: [grant('besta-leve'), grant('virotes-20')] },
      { id: 'dagger', label: 'Adaga', description: 'Arma simples para emergencias.', grants: [grant('adaga')] },
      { id: 'staff', label: 'Bordao', description: 'Arma simples versatil.', grants: [grant('bordao')] },
    ]),
    group('feiticeiro-foco', 'Foco de conjuracao', 'Escolha como conjurar.', 'classe', 'feiticeiro', 'Feiticeiro', [
      { id: 'pouch', label: 'Bolsa de componentes', description: 'Bolsa com componentes.', grants: [grant('bolsa-componentes')] },
      { id: 'focus', label: 'Foco arcano', description: 'Foco para canalizar magia.', grants: [grant('foco-arcano')] },
    ]),
    group('feiticeiro-pacote', 'Pacote inicial', 'Escolha seu pacote.', 'classe', 'feiticeiro', 'Feiticeiro', [
      { id: 'dungeon', label: 'Pacote de masmorra', description: 'Melhor para aventura tensa.', grants: [grant('pacote-masmorra')] },
      { id: 'explorer', label: 'Pacote de explorador', description: 'Melhor para viagens longas.', grants: [grant('pacote-explorador')] },
    ]),
  ],
  guerreiro: [
    group('guerreiro-armadura', 'Armadura inicial', 'Escolha sua protecao inicial.', 'classe', 'guerreiro', 'Guerreiro', [
      { id: 'chain', label: 'Cota de malha', description: 'Melhor defesa inicial.', grants: [grant('cota-de-malha')] },
      { id: 'leather-bow', label: 'Armadura de couro, arco longo e 20 flechas', description: 'Alternativa leve e a distancia.', grants: [grant('armadura-couro'), grant('arco-longo'), grant('flechas-20')] },
    ]),
    group('guerreiro-principal', 'Armas principais', 'Escolha seu conjunto principal.', 'classe', 'guerreiro', 'Guerreiro', [
      { id: 'weapon-shield', label: 'Espada longa e escudo', description: 'Conjunto equilibrado de frente.', grants: [grant('espada-longa'), grant('escudo')] },
      { id: 'two-weapons', label: 'Espada longa e rapieira', description: 'Duas armas marciais.', grants: [grant('espada-longa'), grant('rapieira')] },
    ]),
    group('guerreiro-secundaria', 'Arma secundaria', 'Escolha a opcao secundaria.', 'classe', 'guerreiro', 'Guerreiro', [
      { id: 'crossbow', label: 'Besta leve e 20 virotes', description: 'Alternativa a distancia.', grants: [grant('besta-leve'), grant('virotes-20')] },
      { id: 'handaxes', label: 'Duas machadinhas', description: 'Alternativa leve para arremesso.', grants: [grant('machadinha', 2)] },
    ]),
    group('guerreiro-pacote', 'Pacote inicial', 'Escolha seu kit de viagem.', 'classe', 'guerreiro', 'Guerreiro', [
      { id: 'dungeon', label: 'Pacote de masmorra', description: 'Melhor para combates em ambiente fechado.', grants: [grant('pacote-masmorra')] },
      { id: 'explorer', label: 'Pacote de explorador', description: 'Melhor para campo aberto.', grants: [grant('pacote-explorador')] },
    ]),
  ],
  ladino: [
    group('ladino-arma', 'Arma inicial', 'Escolha sua arma principal.', 'classe', 'ladino', 'Ladino', [
      { id: 'rapier', label: 'Rapieira', description: 'Acuidade e dano melhor.', grants: [grant('rapieira')] },
      { id: 'shortsword', label: 'Espada curta', description: 'Leve e agil.', grants: [grant('espada-curta')] },
    ]),
    group('ladino-secundaria', 'Arma secundaria', 'Escolha seu segundo conjunto.', 'classe', 'ladino', 'Ladino', [
      { id: 'shortbow', label: 'Arco curto e 20 flechas', description: 'Melhor para combate furtivo a distancia.', grants: [grant('arco-curto'), grant('flechas-20')] },
      { id: 'shortsword', label: 'Espada curta adicional', description: 'Permite combate com duas armas.', grants: [grant('espada-curta')] },
    ]),
    group('ladino-pacote', 'Pacote inicial', 'Escolha seu kit.', 'classe', 'ladino', 'Ladino', [
      { id: 'burglar', label: 'Pacote de ladrao', description: 'Ideal para infiltracao.', grants: [grant('pacote-ladrao')] },
      { id: 'dungeon', label: 'Pacote de masmorra', description: 'Alternativa para exploracao agressiva.', grants: [grant('pacote-masmorra')] },
      { id: 'explorer', label: 'Pacote de explorador', description: 'Alternativa de campo.', grants: [grant('pacote-explorador')] },
    ]),
  ],
  mago: [
    group('mago-arma', 'Arma inicial', 'Escolha sua arma basica.', 'classe', 'mago', 'Mago', [
      { id: 'staff', label: 'Bordao', description: 'A opcao classica do mago.', grants: [grant('bordao')] },
      { id: 'dagger', label: 'Adaga', description: 'Alternativa leve e facil de carregar.', grants: [grant('adaga')] },
    ]),
    group('mago-foco', 'Foco de conjuracao', 'Escolha como conjurar suas magias.', 'classe', 'mago', 'Mago', [
      { id: 'pouch', label: 'Bolsa de componentes', description: 'Bolsa com materiais magicos.', grants: [grant('bolsa-componentes')] },
      { id: 'focus', label: 'Foco arcano', description: 'Foco arcano a escolha.', grants: [grant('foco-arcano')] },
    ]),
    group('mago-pacote', 'Pacote inicial', 'Escolha seu pacote.', 'classe', 'mago', 'Mago', [
      { id: 'scholar', label: 'Pacote de estudioso', description: 'Ideal para pesquisa.', grants: [grant('pacote-estudioso')] },
      { id: 'explorer', label: 'Pacote de explorador', description: 'Melhor para aventura.', grants: [grant('pacote-explorador')] },
    ]),
  ],
  monge: [
    group('monge-arma', 'Arma inicial', 'Escolha sua arma.', 'classe', 'monge', 'Monge', [
      { id: 'shortsword', label: 'Espada curta', description: 'Mais ofensiva e agil.', grants: [grant('espada-curta')] },
      { id: 'staff', label: 'Bordao', description: 'Arma simples versatil.', grants: [grant('bordao')] },
      { id: 'spear', label: 'Lanca', description: 'Alternativa simples.', grants: [grant('lanca')] },
    ]),
    group('monge-pacote', 'Pacote inicial', 'Escolha seu kit.', 'classe', 'monge', 'Monge', [
      { id: 'dungeon', label: 'Pacote de masmorra', description: 'Melhor para exploracao subterranea.', grants: [grant('pacote-masmorra')] },
      { id: 'explorer', label: 'Pacote de explorador', description: 'Melhor para jornadas longas.', grants: [grant('pacote-explorador')] },
    ]),
  ],
  paladino: [
    group('paladino-principal', 'Armas principais', 'Escolha seu conjunto principal.', 'classe', 'paladino', 'Paladino', [
      { id: 'weapon-shield', label: 'Espada longa e escudo', description: 'Pacote defensivo classico.', grants: [grant('espada-longa'), grant('escudo')] },
      { id: 'two-weapons', label: 'Espada longa e martelo de guerra', description: 'Duas armas marciais.', grants: [grant('espada-longa'), grant('martelo-guerra')] },
    ]),
    group('paladino-secundaria', 'Arma secundaria', 'Escolha sua segunda opcao.', 'classe', 'paladino', 'Paladino', [
      { id: 'javelins', label: 'Cinco azagaias', description: 'Opcao a distancia basica.', grants: [grant('azagaia', 5)] },
      { id: 'mace', label: 'Maca', description: 'Arma simples corpo a corpo.', grants: [grant('maca')] },
      { id: 'spear', label: 'Lanca', description: 'Arma simples versatil.', grants: [grant('lanca')] },
    ]),
    group('paladino-pacote', 'Pacote inicial', 'Escolha seu kit.', 'classe', 'paladino', 'Paladino', [
      { id: 'priest', label: 'Pacote de sacerdote', description: 'Mais tematico para devocao.', grants: [grant('pacote-sacerdote')] },
      { id: 'explorer', label: 'Pacote de explorador', description: 'Melhor para campo aberto.', grants: [grant('pacote-explorador')] },
    ]),
  ],
  patrulheiro: [
    group('patrulheiro-armadura', 'Armadura inicial', 'Escolha sua protecao.', 'classe', 'patrulheiro', 'Patrulheiro', [
      { id: 'scale', label: 'Armadura de escamas', description: 'Melhor defesa base.', grants: [grant('armadura-escamas')] },
      { id: 'leather', label: 'Armadura de couro', description: 'Mais leve e furtiva.', grants: [grant('armadura-couro')] },
    ]),
    group('patrulheiro-armas', 'Armas secundarias', 'Escolha seu conjunto secundario.', 'classe', 'patrulheiro', 'Patrulheiro', [
      { id: 'two-shortswords', label: 'Duas espadas curtas', description: 'Combate com duas armas.', grants: [grant('espada-curta', 2)] },
      { id: 'spear-mace', label: 'Lanca e maca', description: 'Duas armas simples corpo a corpo.', grants: [grant('lanca'), grant('maca')] },
    ]),
    group('patrulheiro-pacote', 'Pacote inicial', 'Escolha seu kit de viagem.', 'classe', 'patrulheiro', 'Patrulheiro', [
      { id: 'dungeon', label: 'Pacote de masmorra', description: 'Melhor para terrenos fechados.', grants: [grant('pacote-masmorra')] },
      { id: 'explorer', label: 'Pacote de explorador', description: 'Melhor para rastreamento e viagens.', grants: [grant('pacote-explorador')] },
    ]),
  ],
}

export const fixedClassEquipment: Record<string, EquipmentGrant[]> = {
  bardo: [grant('armadura-couro'), grant('adaga')],
  bruxo: [grant('armadura-couro'), grant('adaga', 2)],
  clerigo: [grant('escudo'), grant('simbolo-sagrado')],
  druida: [grant('armadura-couro'), grant('pacote-explorador'), grant('foco-druidico')],
  feiticeiro: [grant('adaga', 2)],
  ladino: [grant('armadura-couro'), grant('adaga', 2), grant('ferramentas-ladrao')],
  mago: [grant('livro-magias')],
  monge: [grant('dardo', 10)],
  paladino: [grant('cota-de-malha'), grant('simbolo-sagrado')],
  patrulheiro: [grant('arco-longo'), grant('flechas-20')],
}

export const backgroundEquipmentItems: Record<string, EquipmentGrant[]> = {
  acolito: [grant('pacote-acolito')],
  charlatao: [grant('pacote-charlatao')],
  criminoso: [grant('pacote-criminoso')],
  artista: [grant('pacote-artista-antecedente')],
  'heroi-do-povo': [grant('pacote-heroi-do-povo')],
  'artesao-guilda': [grant('pacote-artesao-guilda')],
  eremita: [grant('pacote-eremita')],
  nobre: [grant('pacote-nobre')],
  forasteiro: [grant('pacote-forasteiro')],
  sabio: [grant('pacote-sabio')],
  marinheiro: [grant('pacote-marinheiro')],
  soldado: [grant('pacote-soldado')],
  orfao: [grant('pacote-orfao')],
}
