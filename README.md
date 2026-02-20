# Projeto OMIE — Início rápido

Este documento descreve como subir a **base do Strapi CMS** e o **frontend Next.js** conforme a documentação em `docs/`.

## Visão geral

- **Strapi (pasta `cms/` ou hospedado externamente)**: headless CMS para páginas, blog (posts, categorias) e menus. Pode rodar localmente ou em outro host (ex.: [Strapi Cloud](https://cloud.strapi.io)).
- **Next.js (pasta `front/`)**: frontend com App Router, **Tailwind CSS v4** e anti-corruption layer em `lib/strapi/`.

## 1. Strapi CMS

### Pré-requisitos

- Node.js 20+
- npm (ou yarn/pnpm)

### Instalação e primeiro uso

O projeto já contém a pasta `cms/` criada com Strapi 5 e os content-types definidos em schema, com **controllers**, **routes** e **services** (obrigatórios para as rotas REST e para aparecer em API Tokens → Token permissions):

- **Post** — blog (title, slug, excerpt, content, featuredImage, category, author)
- **Category** — categorias do blog (name, slug, posts)
- **Page** — páginas institucionais (title, slug, content, featuredImage)
- **Menu** — menus de navegação (slug: `header` | `footer`, items: componente repeatable)

```bash
cd cms
npm install   # se ainda não instalou
npm run build # rebuild para carregar controllers/routes/services
npm run develop
```

**Nota:** Se Menu, Post, Page, Category não aparecerem em API Tokens → Token permissions, apague `.cache`, `build` e `dist`, rode `npm run build` e reinicie o Strapi.

Na primeira execução:

1. Crie o primeiro usuário admin (email e senha).
2. Em **Content-Type Builder** (ou já criados via schemas em `src/api/`), confira Post, Category, Page, Menu.
3. Em **Settings → API Tokens**, crie um token (Full access ou apenas leitura para os content-types) e copie o valor.
4. **Importante**: ao criar ou editar o token, marque as permissões para cada content-type que o front vai consumir:
   - **Menu** — pelo menos `find` e `findOne` (senão `/api/menus` retorna 404).
   - **Post** — `find`, `findOne`.
   - **Page** — `find`, `findOne`.
   - **Category** — `find`, `findOne` (se o front popular categorias nos posts).

O Strapi ficará em `http://localhost:1337`. A API REST está em `http://localhost:1337/api/posts`, `/api/pages`, `/api/menus`, etc.

### CMS hospedado em outro local (ex.: Strapi Cloud)

O frontend **não exige** que o Strapi rode na mesma máquina. Basta apontar as variáveis de ambiente do `front/` para a URL e o token da sua instância:

- **Strapi Cloud**: após criar o projeto em [cloud.strapi.io](https://cloud.strapi.io), use a URL da API (ex.: `https://seu-projeto.strapiapp.com`) e um API Token gerado no painel.
- **Outro servidor**: use a URL base da API (ex.: `https://cms.seudominio.com`).

#### Permissões do API Token (obrigatório no Strapi Cloud)

No Strapi, **todos os content-types são privados por padrão**. Se o token não tiver permissão para um content-type, a API devolve **404** para esse endpoint (ex.: `/api/menus`).

Depois de fazer deploy (ex.: Strapi Cloud):

1. Acesse o **Admin** do Strapi (ex.: `https://orderly-ducks-540238bfe6.strapiapp.com/admin`).
2. Vá em **Settings** (engrenagem) → **API Tokens**.
3. Crie um token ou edite o token que o front usa.
4. Em **Token type**, escolha "Read-only" (só leitura) ou "Full access" conforme necessário.
5. Em **Token permissions**, habilite para cada content-type que o front consome:
   - **Menu**: `find`, `findOne`
   - **Post**: `find`, `findOne`
   - **Page**: `find`, `findOne`
   - **Category**: `find`, `findOne`
6. Salve e use o token em `STRAPI_API_TOKEN` no `front/.env` ou `.env.local`.

Sem essas permissões, o health check em `/api/strapi-health` continuará com `ok: false` e `strapi.status: 404` para menus.

No `front/.env.local`:

```bash
STRAPI_API_URL=https://seu-projeto.strapiapp.com   # ou sua URL
STRAPI_API_TOKEN=<token da instância>
STRAPI_MOCK=false
```

O front consome a mesma API REST; tanto faz ser localhost ou cloud.

### Menu (header/footer)

O front espera dois menus com `slug` **header** e **footer**. Em **Content Manager → Menu**, crie duas entradas:

- slug: `header`, items: `[{"id": "1", "label": "Início", "url": "/"}, {"id": "2", "label": "Blog", "url": "/blog"}]`
- slug: `footer`, items: conforme necessário (mesmo formato JSON).

O campo `items` é um JSON array de `{ "id": string, "label": string, "url": string, "children"?: [...] }`.

#### Para usuários leigos: não é obrigatório usar JSON

Hoje o content-type **Menu** usa um único campo **JSON** por simplicidade. Para editores que não querem mexer em JSON, a melhor opção é evoluir o schema para **componentes dinâmicos** no Strapi:

1. **Componente repeatable** (ex.: `MenuItem`) com campos: `label` (texto), `url` (texto), e opcionalmente `children` (outro repeatable aninhado).
2. No **Content-Type Builder** → Menu: trocar o atributo `items` de tipo **JSON** para tipo **Component** (repeatable), usando esse componente.
3. No front, o transformer em `lib/strapi/` continua consumindo a mesma estrutura lógica; a API do Strapi passa a retornar o array de itens já como relação/componente.

Assim, no **Content Manager** o usuário passa a preencher "Label" e "URL" em formulário, adicionar subitens por botão, sem editar JSON. Custom Post Types (CPT) e outros conteúdos estruturados seguem a mesma ideia: preferir **relações e componentes** no Strapi em vez de campos JSON quando o público for leigo.

O schema atual do Menu está em `cms/src/api/menu/content-types/menu/schema.json`.

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

### Tailwind CSS

O projeto **já está preparado** para usar **Tailwind CSS v4**:

- Dependências em `front/package.json`: `tailwindcss` e `@tailwindcss/postcss`.
- Entrada em `front/src/app/globals.css`: `@import "tailwindcss"` e blocos `@theme inline` com tokens (cores, fontes).
- PostCSS em `front/postcss.config.mjs` com `@tailwindcss/postcss`.
- **Pre-commit**: Husky + lint-staged garantem `npm run build` e `npm run lint` antes de cada commit (ver seção Pre-Commit).

Use classes utilitárias Tailwind nos componentes; evite CSS custom ou `style` inline quando Tailwind resolver. Padrões e tokens do Design System estão em `docs/CODING-PATTERNS.md` e `docs/ARCHITECTURE-OVERVIEW.md`. **Sempre prefira variáveis de cor** (ver `front/src/app/globals.css` e rule `design-system.mdc`).

### Estrutura do front (resumo)

- `src/app/` — App Router (layout, home, blog, blog/[slug]).
- `src/app/components/` — layout (Header, Footer) e blog (PostCard, PostList).
- `lib/strapi/` — anti-corruption layer:
  - `client.ts` — ponto de entrada (getPosts, getPost, getPage, getMenus).
  - `types.ts` — tipos do domínio (Post, Page, MenuItem, etc.).
  - `api/` — chamadas REST ao Strapi (uso interno).
  - `transformers.ts` — resposta Strapi → tipos do domínio.
  - `client.mock.ts` — mock quando `STRAPI_MOCK=true`.

Nenhum componente importa de `lib/strapi/api/*`; apenas de `client` e `types`.

### Pre-Commit (Husky + lint-staged)

No `front/`, o pre-commit executa automaticamente:

- `npm run lint` nos arquivos staged
- `npm run build` para garantir que Tailwind e Next.js compilam corretamente

Para configurar (uma vez):

```bash
cd front
npm run prepare  # instala hooks do Husky
```

## 3. Ordem recomendada

1. Subir o Strapi (`cms`), criar admin e token.
2. Configurar `front/.env.local` com `STRAPI_API_URL`, `STRAPI_API_TOKEN` e `STRAPI_MOCK=false`.
3. Subir o Next.js (`front`) e acessar a home e o blog.

## 4. Documentação detalhada

- Arquitetura: `docs/ARCHITECTURE-OVERVIEW.md`
- Integração Strapi e ACL: `docs/INTEGRATION-PATTERNS.md`
- Padrões de código: `docs/CODING-PATTERNS.md`
- Checklist de implementação: `docs/IMPLEMENTATION-CHECKLIST.md`
- PageSpeed e SSR: `docs/PAGESPEED-PERFORMANCE.md`

---

**Última atualização**: Fevereiro 2026
