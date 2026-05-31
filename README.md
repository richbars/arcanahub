# Criador de Personagens D&D 5e (PT-BR)

Aplicacao web completa para criacao de personagens de Dungeons & Dragons 5a Edicao, com fluxo guiado em 12 etapas, calculos automaticos, persistencia local e exportacao de ficha.

## Stack

- React 19 + TypeScript + Vite
- TailwindCSS + componentes estilo shadcn/ui
- Zustand para estado global
- React Hook Form + Zod para validacao
- Framer Motion + Lucide Icons
- IndexedDBx para salvar personagens localmente
- PWA via vite-plugin-pwa

## Funcionalidades principais

- Wizard completo de criacao (etapas 1 a 12)
- Metodo padrao de atributos: 15, 14, 13, 12, 10, 8
- Calculos automaticos de:
  - modificadores de atributo
  - HP por nivel
  - CA
  - iniciativa
  - bonus de proficiencia
  - slots de magia
  - pericias
- Recomendacoes contextuais no painel Assistente do Aventureiro
- Recomendacoes de combos raca + classe
- CRUD local de personagens com IndexedDB:
  - criar
  - editar
  - duplicar
  - excluir
  - importar/exportar JSON
- Exportacao da ficha:
  - PDF
  - JSON
  - impressao

## Scripts

- Desenvolvimento: npm run dev
- Build de producao: npm run build
- Preview da build: npm run preview
- Lint: npm run lint

## Estrutura

O projeto esta organizado em:

- src/components
- src/pages
- src/features
- src/hooks
- src/stores
- src/types
- src/data
- src/utils
- src/services
- src/schemas

## Observacoes

- O banco de dados de regras (racas, classes, subclasses, talentos, equipamentos, pericias, magias e antecedentes) esta em arquivos JSON em src/data.
- A base foi preparada para extensao de conteudo oficial completo sem alterar a arquitetura principal.
