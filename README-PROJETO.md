# Projeto OMIE — Início rápido

Este documento descreve como subir a **base do Strapi CMS** e o **frontend Next.js** conforme a documentação em `docs/`.

## Visão geral

- **Strapi (pasta `cms/`)**: headless CMS para páginas, blog (posts, categorias) e menus.
- **Next.js (pasta `front/`)**: frontend com App Router, Tailwind v4 e anti-corruption layer em `lib/strapi/`.

## 1. Strapi CMS

### Pré-requisitos

- Node.js 20+
- npm (ou yarn/pnpm)

### Instalação e primeiro uso

O projeto já contém a pasta `cms/` criada com Strapi 5 e os content-types definidos em schema:

- **Post** — blog (title, slug, excerpt, content, featuredImage, category, author)
- **Category** — categorias do blog (name, slug, posts)
- **Page** — páginas institucionais (title, slug, content, featuredImage)
- **Menu** — menus de navegação (slug: `header` | `footer`, items: JSON)

```bash
cd cms
npm install   # se ainda não instalou
npm run develop
```

Na primeira execução:

1. Crie o primeiro usuário admin (email e senha).
2. Em **Content-Type Builder** (ou já criados via schemas em `src/api/`), confira Post, Category, Page, Menu.
3. Em **Settings → API Tokens**, crie um token (Full access ou apenas leitura para os content-types) e copie o valor.

O Strapi ficará em `http://localhost:1337`. A API REST está em `http://localhost:1337/api/posts`, `/api/pages`, etc.

### Menu (header/footer)

O front espera dois menus com `slug` **header** e **footer**. Em **Content Manager → Menu**, crie duas entradas:

- slug: `header`, items: `[{"id": "1", "label": "Início", "url": "/"}, {"id": "2", "label": "Blog", "url": "/blog"}]`
- slug: `footer`, items: conforme necessário (mesmo formato JSON).

O campo `items` é um JSON array de `{ "id": string, "label": string, "url": string, "children"?: [...] }`.

## 2. Frontend Next.js

### Variáveis de ambiente

Na pasta `front/`, crie `.env.local` a partir do exemplo:

```bash
cd front
cp .env.example .env.local
```

Edite `.env.local`:

- **Com Strapi rodando**  
  - `STRAPI_API_URL=http://localhost:1337`  
  - `STRAPI_API_TOKEN=<token criado no Strapi>`  
  - `STRAPI_MOCK=false`

- **Sem Strapi (só front)**  
  - `STRAPI_MOCK=true` — o front usa dados mock em `lib/strapi/client.mock.ts`.

### Instalação e execução

```bash
cd front
npm install
npm run dev
```

O site ficará em `http://localhost:3000`.

### Estrutura do front (resumo)

- `src/app/` — App Router (layout, home, blog, blog/[slug]).
- `src/app/components/` — layout (Header, Footer) e blog (PostCard, PostList).
- `src/lib/strapi/` — anti-corruption layer:
  - `client.ts` — ponto de entrada (getPosts, getPost, getPage, getMenus).
  - `types.ts` — tipos do domínio (Post, Page, MenuItem, etc.).
  - `api/` — chamadas REST ao Strapi (uso interno).
  - `transformers.ts` — resposta Strapi → tipos do domínio.
  - `client.mock.ts` — mock quando `STRAPI_MOCK=true`.

Nenhum componente importa de `lib/strapi/api/*`; apenas de `client` e `types`.

## 3. Ordem recomendada

1. Subir o Strapi (`cms`), criar admin e token.
2. Configurar `front/.env.local` com `STRAPI_API_URL`, `STRAPI_API_TOKEN` e `STRAPI_MOCK=false`.
3. Subir o Next.js (`front`) e acessar a home e o blog.

## 4. Documentação detalhada

- Arquitetura: `docs/ARCHITECTURE-OVERVIEW.md`
- Integração Strapi e ACL: `docs/INTEGRATION-PATTERNS.md`
- Padrões de código: `docs/CODING-PATTERNS.md`
- Checklist de implementação: `docs/IMPLEMENTATION-CHECKLIST.md`

---

**Última atualização**: Fevereiro 2026
