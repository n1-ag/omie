# PageSpeed e SSR — Boas Práticas OMIE

Guia para maximizar SSR, Core Web Vitals e pontuação no PageSpeed Insights.

> **Navigation**: Return to [ARCHITECTURE-OVERVIEW.md](./ARCHITECTURE-OVERVIEW.md) | See also [CODING-PATTERNS.md](./CODING-PATTERNS.md) | [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md)

## Princípio Central

**Prioridade 1**: Renderização no servidor (SSR/SSG). **Prioridade 2**: Minimizar JavaScript no cliente. **Prioridade 3**: Otimizar recursos (imagens, fontes, CSS).

---

## 1. Server Components por Padrão

| Regra | Impacto PageSpeed |
|-------|-------------------|
| Todo componente é Server Component por padrão | Menos JS no bundle → LCP, FCP melhores |
| `'use client'` somente quando houver interatividade (onClick, useState, etc.) | TTI reduzido |
| Data fetching em Server Components | HTML pré-renderizado, sem loading states no client |

### Quando usar Client Component

- Formulários com validação em tempo real
- Carrosséis, modais, accordions interativos
- Componentes que usam `useEffect`, `useState`, `useRef` com DOM
- Bibliotecas que requerem `window` ou browser APIs

### Anti-pattern

```tsx
// ❌ ERRADO: Client Component sem necessidade
'use client'
export function PostCard({ post }) {
  return <article>{post.title}</article>
}

// ✅ CORRETO: Server Component
export function PostCard({ post }) {
  return <article>{post.title}</article>
}
```

---

## 2. Core Web Vitals

### LCP (Largest Contentful Paint)

- Usar `next/image` para todas as imagens; definir `width`, `height` ou `fill` para evitar CLS
- Preload da fonte Poppins via `next/font` (já configurado)
- LCP hero: colocar conteúdo crítico no HTML inicial; evitar lazy-load do hero

### INP / FID (Interactivity)

- Evitar `'use client'` em componentes que não interagem
- Delegar event handlers apenas onde necessário (composition)

### CLS (Cumulative Layout Shift)

- Sempre definir dimensões em imagens (`width`/`height` ou `sizes` em `next/image`)
- Evitar inserção dinâmica de conteúdo acima da dobra sem reserva de espaço
- Fontes com `display: 'swap'` (já configurado no Poppins)

---

## 3. Imagens

- **Obrigatório**: `next/image` com `width`, `height` ou `fill`
- Configurar `remotePatterns` em `next.config.ts` para Strapi/CDN
- Usar `sizes` para responsive images
- `priority` em imagens acima da dobra (hero, LCP)

```tsx
import Image from 'next/image'

<Image
  src={post.featuredImage}
  alt={post.title}
  width={600}
  height={400}
  sizes="(max-width: 768px) 100vw, 600px"
  priority={isAboveFold}
/>
```

---

## 4. Fontes

- Poppins via `next/font/google` (otimização automática)
- `display: 'swap'` para evitar FOIT
- Subset `latin` para reduzir tamanho

---

## 5. Cache e Revalidação

| Tipo | Estratégia | Exemplo |
|------|------------|---------|
| Blog listing | ISR `revalidate: 60` | `export const revalidate = 60` |
| Posts individuais | ISR + `generateStaticParams` | Pré-render dos slugs mais acessados |
| Páginas institucionais | SSG + on-demand revalidation | Webhook Strapi → `/api/revalidate` |

---

## 6. Metadata e SEO

- `export const metadata` ou `generateMetadata` em todas as páginas
- `generateMetadata` para posts dinâmicos (title, description, og:image)
- Evitar metadata client-side

---

## 7. Anti-Patterns que prejudicam PageSpeed

| Anti-Pattern | Solução |
|--------------|---------|
| Data fetching em Client Component | Mover para Server Component ou passar via props |
| `useEffect` para buscar dados | Usar Server Component + `async` |
| `<img>` nativo | `next/image` |
| CSS-in-JS pesado | Tailwind (utility-first, purged) |
| Bundle de libs client-only em páginas SSR | Dynamic import com `ssr: false` + lazy |
| Muitos Client Components aninhados | Extrair interatividade para folhas da árvore |

---

## 8. Checklist PageSpeed

Antes de merge, verificar:

- [ ] Todas as páginas principais são Server Components
- [ ] Imagens usam `next/image` com dimensões
- [ ] Hero/LCP não depende de JS para renderizar
- [ ] Fontes via `next/font` com `display: swap`
- [ ] `revalidate` configurado em rotas dinâmicas
- [ ] Sem `'use client'` desnecessário
- [ ] Rodar PageSpeed Insights em staging antes do deploy

---

**Last Updated**: Fevereiro 2026
