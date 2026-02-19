# Checklists de Implementacao — Projeto OMIE

Checklists praticas para garantir qualidade e consistencia em cada tipo de tarefa.

> **Navigation**: Return to [ARCHITECTURE-OVERVIEW.md](./ARCHITECTURE-OVERVIEW.md) | See also [CODING-PATTERNS.md](./CODING-PATTERNS.md) | [INTEGRATION-PATTERNS.md](./INTEGRATION-PATTERNS.md)

## Quick Reference (For LLMs)

**When to use this doc**: Starting a new feature, creating components, or before committing

**Key rules**:
- Seguir a checklist correspondente ao tipo de tarefa
- Validar contra o Design System antes de finalizar
- Rodar `npm run build` e `npm run lint` antes de commitar

**See also**:
- [CODING-PATTERNS.md](./CODING-PATTERNS.md) — padroes detalhados
- [INTEGRATION-PATTERNS.md](./INTEGRATION-PATTERNS.md) — anti-corruption layer

---

## Table of Contents

- [Nova Pagina](#nova-pagina)
- [Novo Componente UI](#novo-componente-ui)
- [Nova Integracao (API Externa)](#nova-integracao-api-externa)
- [Novo Blog Feature](#novo-blog-feature)
- [Pre-Commit](#pre-commit)
- [Anti-Patterns a Evitar](#anti-patterns-a-evitar)
- [Verificacao do Design System](#verificacao-do-design-system)

---

## Nova Pagina

Ao criar uma nova pagina (`app/**/page.tsx`):

### Estrutura

- [ ] Arquivo em `app/` seguindo convencao do App Router
- [ ] Server Component por padrao (sem `'use client'` a menos que necessario)
- [ ] Page enxuta — delega para `lib/` e compoe componentes

### Dados

- [ ] Dados buscados via `lib/strapi/client.ts` (anti-corruption layer)
- [ ] Tipagem completa — sem `any`
- [ ] Revalidacao configurada (`export const revalidate = X` ou `next: { revalidate }`)

### SEO

- [ ] `metadata` ou `generateMetadata` configurado
- [ ] `title` e `description` definidos
- [ ] `og:image` quando aplicavel
- [ ] Para paginas dinamicas: `generateStaticParams` implementado

### Visual

- [ ] Layout segue padroes do Design System (`site/design-system.html`)
- [ ] Tailwind classes utilizadas (sem `style` inline)
- [ ] Responsivo: testado em mobile, tablet e desktop
- [ ] Section paddings conforme DS: 4rem (mobile) → 5rem (desktop) → 6rem (wide)

### Error Handling

- [ ] `error.tsx` criado para a rota (se relevante)
- [ ] `loading.tsx` criado para loading state
- [ ] `not-found.tsx` para paginas dinamicas (se aplicavel)

### Build

- [ ] `npm run build` passa sem erros
- [ ] `npm run lint` passa sem erros

---

## Novo Componente UI

Ao criar um componente visual reutilizavel (`app/components/`):

### Design System Compliance

- [ ] Consultar `site/design-system.html` antes de implementar
- [ ] Cores usadas existem na paleta do DS
- [ ] Tipografia segue os tokens do DS (fonte, tamanho, peso)
- [ ] Border-radius conforme tokens: 8px (card), 12px (card-hover), 40px (button)
- [ ] Espacamento conforme padroes do DS

### Implementacao

- [ ] Server Component por padrao (Client Component apenas se tiver interatividade)
- [ ] Props tipadas com interface
- [ ] Tailwind classes (sem CSS custom ou `style` inline desnecessario)
- [ ] Variantes definidas via props (nao via classes condicionais espalhadas)

### Interacao

- [ ] Hover states conforme DS: box-shadow para botoes, scale para cards
- [ ] Transitions: `all .2s linear` (padrao do DS)
- [ ] Focus states acessiveis
- [ ] Cursor pointer em elementos clicaveis

### Responsividade

- [ ] Mobile-first: classes base para mobile
- [ ] Breakpoints: `md:` (tablet), `lg:` (desktop), `xl:` (wide)
- [ ] Testado em pelo menos 3 larguras (mobile 375px, tablet 768px, desktop 1366px)

### Qualidade

- [ ] Sem `any` em props ou tipos
- [ ] Sem logica de negocio — componente e puramente apresentacional
- [ ] Nome semantico e auto-explicativo

---

## Nova Integracao (API Externa)

Ao integrar com uma nova API externa (Strapi ja incluso, mas tambem analytics, CRM, etc.):

### Anti-Corruption Layer

- [ ] Pasta criada em `lib/<nome>/`
- [ ] `client.ts` como ponto de entrada unico
- [ ] `types.ts` com interfaces do dominio (nao da API externa)
- [ ] `transformers.ts` para converter dados da API → tipos do dominio
- [ ] `api/` ou `queries/` para detalhes de comunicacao (REST/GraphQL)

### Configuracao

- [ ] URLs e tokens em variaveis de ambiente (`.env.local`)
- [ ] Nenhum valor hardcoded
- [ ] Tokens sensisveis SEM prefixo `NEXT_PUBLIC_`

### Resilience

- [ ] Timeout configurado em todas as chamadas (`AbortSignal.timeout`)
- [ ] Tratamento de erro com fallback (nao propagar excecao crua)
- [ ] Fallback gracioso quando API esta indisponivel

### Isolamento

- [ ] Componentes so importam de `client.ts` e `types.ts`
- [ ] Nenhum componente importa de `api/` ou `queries/`
- [ ] Nenhum componente usa `fetch` diretamente para a API
- [ ] Integracao nao depende de outra integracao

### Testabilidade

- [ ] Mock client disponivel para desenvolvimento local
- [ ] Possivel alternar entre mock e producao via env var

---

## Novo Blog Feature

Ao adicionar funcionalidade ao blog (nova secao, filtro, busca, etc.):

### Dados

- [ ] Dados via `lib/strapi/client.ts` — nova funcao adicionada ao client se necessario
- [ ] Tipo adicionado/atualizado em `types.ts` se for dado novo
- [ ] Transformer adicionado/atualizado se formato do Strapi mudou

### Visual

- [ ] Blog Card segue DS: imagem + categoria (`#6EC1E4`, border-left 3px) + data + titulo
- [ ] Grid: 3 colunas desktop, 2 tablet, 1 mobile
- [ ] Search bar: bg petroleo, botao verde lima, border-radius 20px (se aplicavel)
- [ ] Categorias: font-size 12px, weight 600, cor `#6EC1E4`

### SEO

- [ ] Posts individuais com `generateMetadata` (title, description, og:image)
- [ ] `generateStaticParams` para pre-render de posts populares
- [ ] Canonical URLs configuradas

---

## Pre-Commit

Antes de cada commit, verificar:

### Build e Lint

- [ ] `npm run build` — passa sem erros
- [ ] `npm run lint` — passa sem warnings/erros

### Design System

- [ ] Nenhuma cor "inventada" (todas do DS)
- [ ] Nenhum border-radius fora dos tokens
- [ ] Tipografia conforme escala do DS

### Codigo

- [ ] Sem `any` em tipos
- [ ] Sem `'use client'` desnecessario
- [ ] Sem `fetch` direto para Strapi em componentes
- [ ] Sem URLs hardcoded
- [ ] Sem `style` inline (usar Tailwind)

### Anti-Corruption Layer

- [ ] Componentes so importam de `lib/*/client.ts` e `lib/*/types.ts`
- [ ] Nenhum componente importa de `lib/*/api/*` ou `lib/*/queries/*`
- [ ] Variaveis de ambiente para URLs/tokens

---

## Anti-Patterns a Evitar

### Criticos (bloquear commit)

| Anti-Pattern | Correto |
|---|---|
| `fetch(process.env.STRAPI_API_URL)` em componente | `getPosts()` via `lib/strapi/client` |
| `any` em tipos/props | Interface tipada |
| URL hardcoded (`'https://cms.omie.com.br/...'`) | `process.env.STRAPI_API_URL` |
| Token no codigo (`const secret = 'abc123'`) | `process.env.STRAPI_PREVIEW_SECRET` |

### Graves (corrigir antes de merge)

| Anti-Pattern | Correto |
|---|---|
| `'use client'` sem interatividade | Server Component (padrao) |
| Logica de negocio na page | Encapsular em `lib/` |
| `style` inline | Tailwind classes |
| Cor fora do Design System | Usar cores do DS |
| `<img>` nativo | `next/image` |

### Moderados (corrigir quando possivel)

| Anti-Pattern | Correto |
|---|---|
| Componente com 200+ linhas | Quebrar em sub-componentes |
| Props sem interface explicita | Definir interface |
| Fetch sem timeout | `AbortSignal.timeout(10000)` |
| Sem `error.tsx` para rota dinamica | Criar error boundary |

---

## Verificacao do Design System

Checklist visual para garantir compliance com `site/design-system.html`:

### Tipografia

- [ ] Fonte Poppins carregada
- [ ] H1: 2.5rem desktop / 2rem mobile, weight 700
- [ ] H2: 2rem desktop / 1.5rem mobile, weight 700
- [ ] Body: 1rem, weight 400
- [ ] Cor de texto principal: `#001e27`

### Cores

- [ ] Background padrao: `#ffffff` ou `#f7f7f7`
- [ ] Nenhuma cor fora da paleta do DS
- [ ] Gradientes conforme especificado no DS

### Botoes CTA

- [ ] Border-radius: 40px
- [ ] Padding: .625rem 1.5rem
- [ ] Font-weight: 700
- [ ] Transition: all .2s linear
- [ ] Hover: box-shadow (nao background-color change)

### Cards

- [ ] Border-radius correto (8px, 12px ou 16px conforme tipo)
- [ ] Hover: scale(1.15) + shadow para cards de beneficio
- [ ] Blog card: imagem + categoria + data + titulo

### Espacamento

- [ ] Section padding: 4rem (mobile) → 5rem (desktop) → 6rem (wide)
- [ ] Container max-width: 1320px
- [ ] Grid conforme DS

---

**Last Updated**: Fevereiro 2026
