## Descricao

<!-- Descreva o que foi alterado e o motivo. Seja objetivo. -->

## Tipo de mudanca

- [ ] `feat` — Nova funcionalidade
- [ ] `fix` — Correcao de bug
- [ ] `docs` — Alteracao em documentacao
- [ ] `refactor` — Refatoracao (sem mudanca de comportamento)
- [ ] `style` — Ajuste de estilo (formato, lint, etc.)
- [ ] `chore` — Manutencao, configuracao, deps
- [ ] `perf` — Melhoria de performance

## Areas afetadas

- [ ] `front/` — Next.js (App Router, componentes, lib)
- [ ] `cms/` — Strapi (content-types, controllers, services)
- [ ] `docs/` — Documentacao de arquitetura
- [ ] Outro: ___

## Issue relacionada

<!-- Ex.: Fixes #123 ou Relacionado a #456 -->

## Checklist

### Build e Lint

- [ ] `cd front && npm run build` — passa sem erros
- [ ] `cd front && npm run lint` — passa sem warnings/erros
- [ ] `cd cms && npm run build` — passa sem erros (se alterou o CMS)

### Codigo (ver [IMPLEMENTATION-CHECKLIST.md](docs/IMPLEMENTATION-CHECKLIST.md))

- [ ] Sem `any` em tipos/props
- [ ] Componentes so importam de `lib/*/client.ts` e `lib/*/types.ts` (anti-corruption layer)
- [ ] Sem `fetch` direto para Strapi em componentes
- [ ] URLs e tokens em variaveis de ambiente (nunca hardcoded)
- [ ] Sem `'use client'` desnecessario (Server Component por padrao)

### Visual (se houver alteracao de UI)

- [ ] Componentes consultam `site/design-system.html` e seguem os tokens
- [ ] Tailwind classes utilizadas (sem `style` inline)
- [ ] Responsivo testado (mobile, tablet, desktop)
- [ ] Screenshots ou GIFs anexados abaixo (quando aplicavel)

### Integracao (se houver nova API ou alteracao em `lib/strapi/`)

- [ ] Nova pasta em `lib/<nome>/` com client, types e transformers
- [ ] Timeout e tratamento de erro configurados
- [ ] Variaveis de ambiente documentadas em `.env.example`

## Screenshots / Preview

<!-- Anexe imagens ou GIFs quando houver mudancas visuais. -->

## Notas adicionais

<!-- Consideracoes para reviewers, breaking changes, migracoes, etc. -->
