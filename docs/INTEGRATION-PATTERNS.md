# Padroes de Integracao — Projeto OMIE

Padroes e boas praticas para integrar o frontend Next.js com Strapi (CMS) e quaisquer APIs externas futuras.

> **Navigation**: Return to [ARCHITECTURE-OVERVIEW.md](./ARCHITECTURE-OVERVIEW.md) | See also [CODING-PATTERNS.md](./CODING-PATTERNS.md) | [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md)

## Quick Reference (For LLMs)

**When to use this doc**: Integrating with Strapi API, external services, or creating new data sources

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
- [Strapi Integration](#strapi-integration)
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
  api/               # Chamadas REST/GraphQL (interno) — NUNCA exportado para componentes
  transformers.ts   # Converte resposta da API externa → tipos do dominio
```

### Por que usar ACL?

| Beneficio | Descricao |
|---|---|
| **Desacoplamento** | Trocar Strapi por outro CMS requer mudar apenas `lib/strapi/`, nao componentes |
| **Tipagem segura** | Dados transformados em tipos proprios, sem `any` ou estruturas cruas |
| **Testabilidade** | Mock client para testes e desenvolvimento sem API externa |
| **Resilience** | Fallbacks centralizados em um unico lugar |
| **Manutencao** | Mudancas na API externa sao absorvidas na ACL, sem impacto nos componentes |

---

## Strapi Integration

### Estrutura

```
lib/strapi/
  client.ts          # getPosts(), getPost(), getPage(), getMenus(), getCategories()
  types.ts           # Post, Page, Category, Menu, MediaItem
  api/
    posts.ts         # Chamadas REST para posts
    pages.ts         # Chamadas REST para paginas
    menus.ts         # Chamadas REST para menus
  transformers.ts   # Transforma resposta Strapi → Post, Page, etc.
```

### Client (`client.ts`)

O client e o unico ponto de entrada para componentes:

```tsx
import { fetchPostsFromStrapi } from './api/posts'
import { transformPost } from './transformers'
import type { Post, PostListOptions } from './types'

export async function getPosts(options?: PostListOptions): Promise<Post[]> {
  const rawPosts = await fetchPostsFromStrapi(options)
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

Tipos do **dominio** do projeto, nao do Strapi:

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
  start?: number
}
```

### API (`api/posts.ts`)

Detalhes de REST ficam isolados aqui. **Componentes nunca importam deste modulo.**

```tsx
const STRAPI_API_URL = process.env.STRAPI_API_URL!

export async function fetchPostsFromStrapi(options?: PostListOptions) {
  const params = new URLSearchParams({
    'pagination[limit]': String(options?.limit ?? 10),
    'pagination[start]': String(options?.start ?? 0),
    'populate': 'featuredImage,category,author',
  })
  if (options?.category) params.set('filters[category][slug][$eq]', options.category)

  const response = await fetch(`${STRAPI_API_URL}/api/posts?${params}`, {
    headers: {
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status}`)
  }

  const json = await response.json()
  return json.data ?? []
}
```

### Transformers (`transformers.ts`)

Converte a resposta bruta do Strapi em tipos limpos:

```tsx
import type { Post } from './types'

export function transformPost(raw: StrapiPost): Post {
  return {
    id: String(raw.id),
    title: raw.attributes?.title ?? '',
    slug: raw.attributes?.slug ?? '',
    excerpt: stripHtmlTags(raw.attributes?.excerpt ?? ''),
    content: raw.attributes?.content ?? '',
    date: formatDate(raw.attributes?.publishedAt ?? raw.attributes?.createdAt),
    featuredImage: raw.attributes?.featuredImage?.data?.attributes?.url ?? '',
    category: raw.attributes?.category?.data?.attributes?.name ?? '',
    categorySlug: raw.attributes?.category?.data?.attributes?.slug ?? '',
    author: raw.attributes?.author?.data?.attributes?.name ?? 'OMIE',
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
  api/               # Chamadas REST/GraphQL (se aplicavel)
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
const res = await fetch(`${process.env.STRAPI_API_URL}/api/posts`, {
  headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` },
})
```

---

## Mock Client para Desenvolvimento

Para desenvolver sem depender do Strapi rodando, crie um mock client:

```tsx
// lib/strapi/client.mock.ts
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
// lib/strapi/client.ts
const USE_MOCK = process.env.STRAPI_MOCK === 'true'

export const getPosts = USE_MOCK
  ? (await import('./client.mock')).getPosts
  : getPostsFromAPI

// .env.local (desenvolvimento)
STRAPI_MOCK=true

// .env.production
STRAPI_MOCK=false
```

---

## Resilience

### Timeouts

Toda chamada ao Strapi deve ter timeout:

```tsx
const response = await fetch(`${STRAPI_API_URL}/api/posts`, {
  headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` },
  signal: AbortSignal.timeout(10000), // 10 segundos
  next: { revalidate: 60 },
})
```

### Graceful Degradation

Se o Strapi estiver indisponivel, a pagina nao deve quebrar:

```tsx
export async function getPosts(options?: PostListOptions): Promise<Post[]> {
  try {
    const rawPosts = await fetchPostsFromStrapi(options)
    return rawPosts.map(transformPost)
  } catch (error) {
    console.error('Failed to fetch posts from Strapi:', error)
    return [] // Retorna lista vazia em vez de quebrar
  }
}
```

Para paginas estaticas, o ISR do Next.js ja oferece resiliencia: se a revalidacao falhar, a versao cached anterior e servida.

### Tratamento de Erros por Camada

| Camada | Responsabilidade |
|---|---|
| `api/` | Lanca erro HTTP (`throw new Error`) |
| `client.ts` | Captura, loga, retorna fallback ou re-lanca |
| `page.tsx` | Usa `error.tsx` boundary ou condicional |

---

## Security

### Variaveis de Ambiente

URLs e tokens **nunca** sao hardcoded:

```env
# .env.local
STRAPI_API_URL=https://cms.omie.com.br
STRAPI_API_TOKEN=token-seguro-aqui
STRAPI_PREVIEW_SECRET=token-preview-aqui
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

Para atualizar imediatamente quando um editor publica conteudo no Strapi:

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

Configure um webhook no Strapi (Lifecycles ou Admin panel) para chamar esta rota ao publicar/atualizar posts.

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

  if (secret !== process.env.STRAPI_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()
  redirect(`/blog/${slug}`)
}
```

No client, verificar draft mode:

```tsx
// lib/strapi/client.ts
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
  const res = await fetch(`${process.env.STRAPI_API_URL}/api/posts`, { /* ... */ })
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
const res = await fetch('https://cms.omie.com.br/api/posts')

// CORRETO
const res = await fetch(`${process.env.STRAPI_API_URL}/api/posts`)
```

### 3. Falha Cascateada

```tsx
// ERRADO: Strapi fora do ar quebra toda a pagina
export default async function HomePage() {
  const posts = await getPosts() // Lanca excecao se Strapi estiver fora
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

### 4. Tipos do Strapi Vazam para Componentes

```tsx
// ERRADO: componente conhece estrutura interna do Strapi
interface Props {
  post: {
    attributes: { title: string; slug: string }
    id: number
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
// ERRADO: reusar Strapi client para outra API
import { fetchPostsFromStrapi } from '@/lib/strapi/api/posts'
// Usando para buscar dados de CRM... NAO!

// CORRETO: cada integracao tem seu proprio client
import { submitLead } from '@/lib/crm/client'
```

---

**Last Updated**: Fevereiro 2026
