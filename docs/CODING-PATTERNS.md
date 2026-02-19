# Padroes de Codigo — Projeto OMIE

Padroes de implementacao para componentes, pages e services no Next.js.

> **Navigation**: Return to [ARCHITECTURE-OVERVIEW.md](./ARCHITECTURE-OVERVIEW.md) | See also [INTEGRATION-PATTERNS.md](./INTEGRATION-PATTERNS.md) | [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md)

## Quick Reference (For LLMs)

**When to use this doc**: Implementing pages, components, or services

**Key rules**:
- Server Components por padrao, `'use client'` somente com interatividade
- Pages delegam para `lib/` — sem logica de negocio nas pages
- Componentes nunca acessam Strapi API diretamente
- Tailwind classes conforme Design System — sem estilos inline

**See also**:
- [INTEGRATION-PATTERNS.md](./INTEGRATION-PATTERNS.md) — anti-corruption layer, Strapi
- [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md) — checklists

---

## Table of Contents

- [Lean Page Components](#lean-page-components)
- [Server Components vs Client Components](#server-components-vs-client-components)
- [CMS API Leakage Prevention](#cms-api-leakage-prevention)
- [Separacao de Responsabilidades](#separacao-de-responsabilidades)
- [Data Fetching Patterns](#data-fetching-patterns)
- [Component Composition com Tailwind](#component-composition-com-tailwind)
- [Error Handling](#error-handling)
- [Anti-Patterns](#anti-patterns)

---

## Lean Page Components

Pages (`app/**/page.tsx`) devem ser **enxutas**: buscar dados e compor componentes. Sem logica de negocio, transformacao complexa ou manipulacao de dados.

### Rules

- Page components delegam para `lib/` services
- Maximo ~20 linhas de logica por page
- Transformacoes de dados ficam em `lib/` (services ou transformers)
- Pages so conhecem tipos limpos, nunca estruturas cruas do Strapi

### Exemplos

```tsx
// app/blog/page.tsx — CORRETO: page enxuta
import { getPosts } from '@/lib/strapi/client'
import { PostList } from '@/app/components/blog/PostList'

export const revalidate = 60

export default async function BlogPage() {
  const posts = await getPosts({ limit: 12 })
  return (
    <main>
      <h1>Blog OMIE</h1>
      <PostList posts={posts} />
    </main>
  )
}
```

```tsx
// app/blog/page.tsx — ERRADO: logica na page
export default async function BlogPage() {
  const res = await fetch(`${process.env.STRAPI_API_URL}/api/posts`, {
    headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` },
  })
  const data = await res.json()
  const posts = (data.data ?? []).map((p: { attributes: { title: string; slug: string } }) => ({
    title: p.attributes?.title ?? '',
    slug: p.attributes?.slug ?? '',
    // 30 linhas de transformacao...
  }))
  // ...
}
```

---

## Server Components vs Client Components

### Quando usar Server Component (padrao)

- Buscar dados (fetch, database, file system)
- Acessar recursos do backend
- Renderizar conteudo estatico ou semi-estatico
- SEO-critical content

### Quando usar Client Component (`'use client'`)

- Event handlers (onClick, onChange, onSubmit)
- Estado local (useState, useReducer)
- Efeitos (useEffect)
- Browser APIs (window, localStorage, IntersectionObserver)
- Bibliotecas client-only (carouseis, animacoes complexas)

### Regra de Ouro

Se o componente nao precisa de interatividade, **nao** use `'use client'`. Componentes Client sao mais pesados (incluidos no bundle JS do client).

### Pattern: Server Parent + Client Child

```tsx
// app/blog/[slug]/page.tsx (Server Component — busca dados)
import { getPost } from '@/lib/strapi/client'
import { ShareButtons } from '@/app/components/blog/ShareButtons'

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <ShareButtons url={`/blog/${post.slug}`} title={post.title} />
    </article>
  )
}

// app/components/blog/ShareButtons.tsx (Client Component — interatividade)
'use client'

import { useState } from 'react'

interface ShareButtonsProps {
  url: string
  title: string
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex gap-2">
      <button onClick={handleCopy}>
        {copied ? 'Copiado!' : 'Copiar link'}
      </button>
    </div>
  )
}
```

---

## CMS API Leakage Prevention

Componentes **nunca** devem conhecer detalhes da API do Strapi (REST endpoints, estrutura de response). Toda essa complexidade fica encapsulada na anti-corruption layer (`lib/strapi/`).

### Rules

- Componentes so importam de `@/lib/strapi/client` e `@/lib/strapi/types`
- **Nunca** importar de `@/lib/strapi/api/*`
- **Nunca** usar `fetch` direto para Strapi em componentes
- **Nunca** tipar componentes com estruturas do Strapi (ex: resposta bruta da API)

### Exemplo

```tsx
// CORRETO: componente usa tipos limpos
import type { Post } from '@/lib/strapi/types'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article>
      <h3>{post.title}</h3>
      <span>{post.category}</span>
      <time>{post.date}</time>
    </article>
  )
}

// ERRADO: componente conhece estrutura do Strapi
export function PostCard({ post }: { post: { id: number; attributes: { title: string } } }) {
  return (
    <article>
      <h3>{post.attributes.title}</h3>
      <span>{/* dados aninhados do Strapi */}</span>
    </article>
  )
}
```

---

## Separacao de Responsabilidades

| Camada | Responsabilidade | Exemplo |
|---|---|---|
| **Page** (`app/**/page.tsx`) | Routing, SEO, composicao de layout, delegacao para services | `BlogPage`, `PostPage` |
| **Component** (`app/components/`) | Renderizacao visual, recebe dados via props | `PostCard`, `Button`, `Header` |
| **Service/Client** (`lib/`) | Buscar dados, transformar, logica de negocio | `getPosts()`, `getPage()` |
| **Types** (`lib/strapi/types.ts`) | Contratos de dados entre camadas | `Post`, `Page`, `Category` |

### Fluxo

```
Page (Server Component)
  → chama lib/strapi/client.ts (busca + transforma dados)
    → client.ts chama api/ (REST ou GraphQL)
    → client.ts usa transformers.ts para limpar dados
  → passa tipos limpos como props para Components
    → Components renderizam usando Tailwind (tokens do DS)
```

---

## Data Fetching Patterns

### Pattern 1: Listagem com ISR

```tsx
// app/blog/page.tsx
import { getPosts } from '@/lib/strapi/client'

export const revalidate = 60

export default async function BlogPage() {
  const posts = await getPosts({ limit: 12 })
  return <PostList posts={posts} />
}
```

### Pattern 2: Pagina Dinamica com generateStaticParams

```tsx
// app/blog/[slug]/page.tsx
import { getPost, getPostSlugs } from '@/lib/strapi/client'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const slugs = await getPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug)
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [post.featuredImage] },
  }
}

export default async function PostPage({ params }: Props) {
  const post = await getPost(params.slug)
  return <PostContent post={post} />
}
```

### Pattern 3: Dados Compartilhados (Layout)

```tsx
// app/layout.tsx
import { getMenus } from '@/lib/strapi/client'
import { Header } from '@/app/components/layout/Header'
import { Footer } from '@/app/components/layout/Footer'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const menus = await getMenus()
  return (
    <html lang="pt-BR">
      <body>
        <Header navigation={menus.header} />
        {children}
        <Footer navigation={menus.footer} />
      </body>
    </html>
  )
}
```

---

## Component Composition com Tailwind

Criar componentes reutilizaveis usando Tailwind com tokens do Design System.

### Pattern: Component com Variantes

```tsx
interface ButtonProps {
  variant?: 'blue' | 'green' | 'petroleo' | 'transparent'
  children: React.ReactNode
  href?: string
}

const variantClasses = {
  blue: 'bg-[#00e2f4] text-[#001e27] border-[#00e2f4] hover:shadow-[0px_6px_0px_0px_rgba(0,226,244,.6)]',
  green: 'bg-[#d8fe00] text-[#001e27] border-[#d8fe00]',
  petroleo: 'bg-[#001e27] text-white border-[#001e27] hover:shadow-[0px_6px_0px_0px_rgba(0,30,39,.4)]',
  transparent: 'bg-transparent text-[#001e27] border-[#001e27]',
} as const

export function Button({ variant = 'blue', children, href }: ButtonProps) {
  const classes = `
    inline-block rounded-[40px] px-6 py-2.5 font-bold
    border-[3px] transition-all duration-200 ease-linear
    ${variantClasses[variant]}
  `

  if (href) {
    return <a href={href} className={classes}>{children}</a>
  }
  return <button className={classes}>{children}</button>
}
```

---

## Error Handling

### Error Boundaries (App Router)

```tsx
// app/blog/error.tsx (Client Component obrigatorio)
'use client'

export default function BlogError({ error, reset }: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Algo deu errado ao carregar o blog</h2>
      <button onClick={reset}>Tentar novamente</button>
    </div>
  )
}
```

### Loading States

```tsx
// app/blog/loading.tsx
export default function BlogLoading() {
  return <div className="animate-pulse">Carregando posts...</div>
}
```

### Not Found

```tsx
// app/blog/[slug]/not-found.tsx
export default function PostNotFound() {
  return (
    <div>
      <h1>Post nao encontrado</h1>
      <a href="/blog">Voltar ao blog</a>
    </div>
  )
}
```

---

## Anti-Patterns

### 1. `'use client'` Desnecessario

```tsx
// ERRADO: nao precisa ser client component
'use client'

export function PostCard({ post }: { post: Post }) {
  return <div>{post.title}</div> // Sem interatividade!
}

// CORRETO: Server Component (padrao)
export function PostCard({ post }: { post: Post }) {
  return <div>{post.title}</div>
}
```

### 2. Fetch Direto em Componentes

```tsx
// ERRADO: componente conhece API do Strapi
export default async function BlogPage() {
  const res = await fetch(`${process.env.STRAPI_API_URL}/api/posts`, {
    headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` },
  })
}

// CORRETO: usa anti-corruption layer
export default async function BlogPage() {
  const posts = await getPosts()
}
```

### 3. Estilos Fora do Design System

```tsx
// ERRADO: cor inventada, nao existe no DS
<button className="bg-blue-500 text-white rounded-lg">

// CORRETO: cores do DS
<button className="bg-[#00e2f4] text-[#001e27] rounded-[40px]">
```

### 4. Logica de Negocio na Page

```tsx
// ERRADO: transformacao de dados na page
export default async function BlogPage() {
  const raw = await getPosts()
  const filtered = raw.filter(p => p.date > new Date('2024-01-01'))
  const sorted = filtered.sort((a, b) => b.views - a.views)
  const grouped = sorted.reduce(/* ... */)
}

// CORRETO: logica encapsulada no service
export default async function BlogPage() {
  const posts = await getPopularPosts({ since: '2024-01-01' })
}
```

### 5. Tipos `any`

```tsx
// ERRADO
function PostCard({ post }: { post: any }) {

// CORRETO
import type { Post } from '@/lib/strapi/types'
function PostCard({ post }: { post: Post }) {
```

---

**Last Updated**: Fevereiro 2026
