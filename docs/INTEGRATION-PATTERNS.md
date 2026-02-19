# Padroes de Integracao — Projeto OMIE

Padroes e boas praticas para integrar o frontend Next.js com WordPress (CMS) e quaisquer APIs externas futuras.

> **Navigation**: Return to [ARCHITECTURE-OVERVIEW.md](./ARCHITECTURE-OVERVIEW.md) | See also [CODING-PATTERNS.md](./CODING-PATTERNS.md) | [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md)

## Quick Reference (For LLMs)

**When to use this doc**: Integrating with WordPress API, external services, or creating new data sources

**Key rules**:
- Toda integracao DEVE ter uma anti-corruption layer em `lib/`
- Client encapsula TODOS os detalhes HTTP/GraphQL — componentes so conhecem tipos limpos
- Variaveis de ambiente para URLs e tokens — nunca hardcoded
- Graceful degradation quando APIs externas falham
- Mock client para desenvolvimento local

**See also**:
- [CODING-PATTERNS.md](./CODING-PATTERNS.md) — CMS API leakage prevention
- [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md) — checklist de nova integracao

---

## Table of Contents

- [Anti-Corruption Layer](#anti-corruption-layer)
- [WordPress Integration](#wordpress-integration)
- [Padrao para Novas Integracoes](#padrao-para-novas-integracoes)
- [Client Encapsulation](#client-encapsulation)
- [Mock Client para Desenvolvimento](#mock-client-para-desenvolvimento)
- [Resilience](#resilience)
- [Security](#security)
- [Cache e Revalidacao](#cache-e-revalidacao)
- [Preview Mode](#preview-mode)
- [Anti-Patterns](#anti-patterns)

---

## Anti-Corruption Layer

### Definicao

A anti-corruption layer (ACL) e uma camada de isolamento entre o frontend e APIs externas. Ela garante que a estrutura interna do sistema nao seja contaminada por formatos, convencoes ou detalhes de implementacao de servicos externos.

### Principio

**Componentes React nunca importam detalhes de API.** Eles so conhecem:
- `client.ts` — funcoes publicas que retornam dados limpos
- `types.ts` — interfaces TypeScript do dominio

### Estrutura Padrao

Para qualquer integracao, a ACL segue esta estrutura:

```
lib/<nome-integracao>/
  client.ts          # Ponto de entrada unico. Funcoes publicas.
  types.ts           # Interfaces TypeScript do dominio (nao da API externa)
  queries/           # Detalhes de comunicacao (GraphQL, REST, SDK) — NUNCA exportado para componentes
  transformers.ts    # Converte resposta da API externa → tipos do dominio
```

### Por que usar ACL?

| Beneficio | Descricao |
|---|---|
| **Desacoplamento** | Trocar WordPress por Strapi requer mudar apenas `lib/wordpress/`, nao componentes |
| **Tipagem segura** | Dados transformados em tipos proprios, sem `any` ou estruturas cruas |
| **Testabilidade** | Mock client para testes e desenvolvimento sem API externa |
| **Resilience** | Fallbacks centralizados em um unico lugar |
| **Manutencao** | Mudancas na API externa sao absorvidas na ACL, sem impacto nos componentes |

---

## WordPress Integration

### Estrutura

```
lib/wordpress/
  client.ts          # getPosts(), getPost(), getPage(), getMenus(), getCategories()
  types.ts           # Post, Page, Category, Menu, MediaItem
  queries/
    posts.ts         # Queries GraphQL para posts
    pages.ts         # Queries GraphQL para paginas
    menus.ts         # Queries GraphQL para menus
  transformers.ts    # Transforma WP_Post → Post, WP_Page → Page, etc.
```

### Client (`client.ts`)

O client e o unico ponto de entrada para componentes:

```tsx
import { fetchPostsFromWP } from './queries/posts'
import { transformPost } from './transformers'
import type { Post, PostListOptions } from './types'

export async function getPosts(options?: PostListOptions): Promise<Post[]> {
  const rawPosts = await fetchPostsFromWP(options)
  return rawPosts.map(transformPost)
}

export async function getPost(slug: string): Promise<Post | null> {
  const rawPost = await fetchPostBySlug(slug)
  if (!rawPost) return null
  return transformPost(rawPost)
}

export async function getPostSlugs(): Promise<string[]> {
  const rawSlugs = await fetchAllPostSlugs()
  return rawSlugs
}
```

### Types (`types.ts`)

Tipos do **dominio** do projeto, nao do WordPress:

```tsx
export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  date: string
  featuredImage: string
  category: string
  categorySlug: string
  author: string
}

export interface Page {
  id: string
  title: string
  slug: string
  content: string
  featuredImage?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  count: number
}

export interface Menu {
  id: string
  items: MenuItem[]
}

export interface MenuItem {
  id: string
  label: string
  url: string
  children?: MenuItem[]
}

export interface PostListOptions {
  limit?: number
  category?: string
  search?: string
  offset?: number
}
```

### Queries (`queries/posts.ts`)

Detalhes de GraphQL ficam isolados aqui. **Componentes nunca importam deste modulo.**

```tsx
const WORDPRESS_GRAPHQL_URL = process.env.WORDPRESS_GRAPHQL_URL!

export async function fetchPostsFromWP(options?: PostListOptions) {
  const query = `
    query GetPosts($first: Int, $after: String) {
      posts(first: $first, after: $after) {
        nodes {
          id
          title
          slug
          excerpt
          content
          date
          featuredImage { node { sourceUrl } }
          categories { nodes { name slug } }
          author { node { name } }
        }
      }
    }
  `

  const response = await fetch(WORDPRESS_GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { first: options?.limit ?? 10 },
    }),
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    throw new Error(`WordPress API error: ${response.status}`)
  }

  const json = await response.json()
  return json.data.posts.nodes
}
```

### Transformers (`transformers.ts`)

Converte a resposta bruta do WordPress em tipos limpos:

```tsx
import type { Post } from './types'

export function transformPost(raw: any): Post {
  return {
    id: raw.id ?? raw.databaseId?.toString(),
    title: raw.title,
    slug: raw.slug,
    excerpt: stripHtmlTags(raw.excerpt ?? ''),
    content: raw.content,
    date: formatDate(raw.date),
    featuredImage: raw.featuredImage?.node?.sourceUrl ?? '',
    category: raw.categories?.nodes?.[0]?.name ?? '',
    categorySlug: raw.categories?.nodes?.[0]?.slug ?? '',
    author: raw.author?.node?.name ?? '',
  }
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
```

---

## Padrao para Novas Integracoes

Qualquer integracao futura (analytics, CRM, servicos de email, APIs de terceiros) DEVE seguir o mesmo padrao:

```
lib/<nome>/
  client.ts          # Funcoes publicas
  types.ts           # Interfaces do dominio
  queries/           # Detalhes de comunicacao (se aplicavel)
  transformers.ts    # Conversao de dados (se aplicavel)
```

### Exemplo: Integracao com API de Analytics

```
lib/analytics/
  client.ts          # trackEvent(), trackPageView()
  types.ts           # AnalyticsEvent, PageViewEvent
```

### Exemplo: Integracao com CRM

```
lib/crm/
  client.ts          # submitLead(), getLead()
  types.ts           # Lead, LeadFormData
  transformers.ts    # Converte form data → formato do CRM
```

---

## Client Encapsulation

O client **encapsula todos os detalhes HTTP/API**. Componentes so conhecem operacoes de negocio.

### Client encapsula:

- URLs e endpoints
- Headers de autenticacao
- Formato de request/response
- Tratamento de erros HTTP
- Timeouts e retries

### Componentes conhecem:

- Funcoes de negocio (`getPosts`, `getPage`)
- Tipos de dominio (`Post`, `Page`)
- **Nada** sobre HTTP, GraphQL, REST, headers, tokens

```tsx
// CORRETO: componente so sabe de negocio
const posts = await getPosts({ limit: 6, category: 'gestao' })

// ERRADO: componente conhece detalhes HTTP
const res = await fetch('https://cms.omie.com.br/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: POSTS_QUERY, variables: { first: 6 } }),
})
```

---

## Mock Client para Desenvolvimento

Para desenvolver sem depender do WordPress rodando, crie um mock client:

```tsx
// lib/wordpress/client.mock.ts
import type { Post, Page } from './types'

const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Como escolher o melhor ERP para sua empresa',
    slug: 'como-escolher-erp',
    excerpt: 'Descubra os criterios essenciais...',
    content: '<p>Conteudo completo do post...</p>',
    date: '16 fevereiro 2026',
    featuredImage: '/mock/blog-post-1.jpg',
    category: 'Contabilidade Empresarial',
    categorySlug: 'contabilidade',
    author: 'OMIE',
  },
  // ... mais posts mock
]

export async function getPosts(): Promise<Post[]> {
  await new Promise((r) => setTimeout(r, 200))
  return mockPosts
}

export async function getPost(slug: string): Promise<Post | null> {
  await new Promise((r) => setTimeout(r, 100))
  return mockPosts.find((p) => p.slug === slug) ?? null
}
```

### Alternando entre Mock e Producao

```tsx
// lib/wordpress/client.ts
const USE_MOCK = process.env.WORDPRESS_MOCK === 'true'

export const getPosts = USE_MOCK
  ? (await import('./client.mock')).getPosts
  : getPostsFromAPI

// .env.local (desenvolvimento)
WORDPRESS_MOCK=true

// .env.production
WORDPRESS_MOCK=false
```

---

## Resilience

### Timeouts

Toda chamada ao WordPress deve ter timeout:

```tsx
const response = await fetch(WORDPRESS_GRAPHQL_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables }),
  signal: AbortSignal.timeout(10000), // 10 segundos
  next: { revalidate: 60 },
})
```

### Graceful Degradation

Se o WordPress estiver indisponivel, a pagina nao deve quebrar:

```tsx
export async function getPosts(options?: PostListOptions): Promise<Post[]> {
  try {
    const rawPosts = await fetchPostsFromWP(options)
    return rawPosts.map(transformPost)
  } catch (error) {
    console.error('Failed to fetch posts from WordPress:', error)
    return [] // Retorna lista vazia em vez de quebrar
  }
}
```

Para paginas estaticas, o ISR do Next.js ja oferece resiliencia: se a revalidacao falhar, a versao cached anterior e servida.

### Tratamento de Erros por Camada

| Camada | Responsabilidade |
|---|---|
| `queries/` | Lanca erro HTTP (`throw new Error`) |
| `client.ts` | Captura, loga, retorna fallback ou re-lanca |
| `page.tsx` | Usa `error.tsx` boundary ou condicional |

---

## Security

### Variaveis de Ambiente

URLs e tokens **nunca** sao hardcoded:

```env
# .env.local
WORDPRESS_API_URL=https://cms.omie.com.br/wp-json/wp/v2
WORDPRESS_GRAPHQL_URL=https://cms.omie.com.br/graphql
WORDPRESS_PREVIEW_SECRET=token-seguro-aqui
```

### Regras

- Prefixo `NEXT_PUBLIC_` somente para variaveis que o browser precisa acessar
- Tokens de preview e autenticacao **nunca** tem prefixo `NEXT_PUBLIC_`
- Nao logar tokens ou dados sensiveis
- Validar SSL em todas as chamadas externas

---

## Cache e Revalidacao

### ISR (Incremental Static Regeneration)

```tsx
// Revalida a cada 60 segundos
export const revalidate = 60

// Ou no fetch individual
const response = await fetch(url, {
  next: { revalidate: 60 },
})
```

### On-Demand Revalidation

Para atualizar imediatamente quando um editor publica conteudo no WordPress:

```tsx
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const body = await request.json()
  const slug = body.slug

  revalidatePath('/blog')
  if (slug) revalidatePath(`/blog/${slug}`)

  return NextResponse.json({ revalidated: true })
}
```

Configure um webhook no WordPress para chamar esta rota ao publicar/atualizar posts.

---

## Preview Mode

Para que editores visualizem rascunhos antes de publicar:

```tsx
// app/api/preview/route.ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')

  if (secret !== process.env.WORDPRESS_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()
  redirect(`/blog/${slug}`)
}
```

No client, verificar draft mode:

```tsx
// lib/wordpress/client.ts
import { draftMode } from 'next/headers'

export async function getPost(slug: string): Promise<Post | null> {
  const { isEnabled: isDraft } = await draftMode()
  const rawPost = isDraft
    ? await fetchDraftPost(slug)
    : await fetchPublishedPost(slug)
  if (!rawPost) return null
  return transformPost(rawPost)
}
```

---

## Anti-Patterns

### 1. Componente Acessa API Diretamente

```tsx
// ERRADO
export default async function BlogPage() {
  const res = await fetch(process.env.WORDPRESS_GRAPHQL_URL!, { /* ... */ })
  const data = await res.json()
}

// CORRETO
export default async function BlogPage() {
  const posts = await getPosts()
}
```

### 2. URL Hardcoded

```tsx
// ERRADO
const res = await fetch('https://cms.omie.com.br/graphql')

// CORRETO
const res = await fetch(process.env.WORDPRESS_GRAPHQL_URL!)
```

### 3. Falha Cascateada

```tsx
// ERRADO: WordPress fora do ar quebra toda a pagina
export default async function HomePage() {
  const posts = await getPosts() // Lanca excecao se WP estiver fora
  const menus = await getMenus() // Nunca executa
}

// CORRETO: falha isolada com fallback
export default async function HomePage() {
  const [posts, menus] = await Promise.all([
    getPosts().catch(() => []),
    getMenus().catch(() => ({ header: [], footer: [] })),
  ])
}
```

### 4. Tipos do WordPress Vazam para Componentes

```tsx
// ERRADO: componente conhece estrutura interna do WordPress
interface Props {
  post: {
    title: { rendered: string }
    _embedded: { 'wp:featuredmedia': Array<{ source_url: string }> }
  }
}

// CORRETO: componente usa tipos limpos do dominio
interface Props {
  post: Post // { title: string, featuredImage: string, ... }
}
```

### 5. Sem Timeout

```tsx
// ERRADO: fetch pode ficar pendente indefinidamente
const res = await fetch(url)

// CORRETO
const res = await fetch(url, {
  signal: AbortSignal.timeout(10000),
})
```

### 6. Client Compartilhado entre Integracoes

```tsx
// ERRADO: reusar WordPress client para outra API
import { fetchGraphQL } from '@/lib/wordpress/queries/posts'
// Usando para buscar dados de CRM... NAO!

// CORRETO: cada integracao tem seu proprio client
import { submitLead } from '@/lib/crm/client'
```

---

**Last Updated**: Fevereiro 2026
