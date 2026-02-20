# Arquitetura do Projeto OMIE

Hub de navegacao e visao geral da arquitetura do site OMIE.

## Quick Reference (For LLMs)

**When to use this doc**: Navigation hub — read first to understand architecture and decide which detailed docs to load.

**Key rules**:
- Load specific docs only when needed (progressive loading)
- Start here when understanding overall architecture

**See also**:
- [CODING-PATTERNS.md](./CODING-PATTERNS.md) — padroes de codigo
- [INTEGRATION-PATTERNS.md](./INTEGRATION-PATTERNS.md) — anti-corruption layer e integracoes
- [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md) — checklists por tarefa

---

## Visao Geral

O site OMIE utiliza **Strapi** como **headless CMS** e Next.js como **frontend**. O Strapi gerencia conteudo (paginas, blog, menus); o Next.js renderiza tudo para o usuario final.

```
[Editor OMIE] → [Strapi CMS] → [REST API / GraphQL]
                                       ↓
                        [Anti-Corruption Layer]
                            (lib/strapi/)
                                       ↓
                     [Next.js 16 (App Router)]
                        Server Components
                        Client Components
                        Tailwind CSS v4
                                       ↓
                          [CDN / Deploy]
                                       ↓
                         [Usuario Final]
```

## Decisoes Arquiteturais

### Por que Strapi Headless?

O site OMIE utiliza um CMS headless para gestao de conteudo com seguranca e flexibilidade. Com Strapi:
- Strapi fica isolado da internet publica (acessivel apenas via API)
- Superficie de ataque reduzida; API REST/GraphQL documentada e controlada
- Performance controlada pelo Next.js (SSG, ISR, CDN)
- Editores usam o painel Strapi (moderno, type-safe com content-types)

### Por que Next.js 16?

- App Router com Server Components para performance otima
- ISR (Incremental Static Regeneration) para blog posts
- SSG para paginas institucionais
- Metadata API nativa para SEO
- Ecossistema React maduro para componentes interativos

### Por que Tailwind CSS sobre Bootstrap?

O Design System original da OMIE (`site/design-system.html`) foi construido sobre Bootstrap 5. O frontend usa **Tailwind CSS v4** como **prioridade maxima para estilizacao** porque:
- Melhor integracao com React/Next.js (utility-first, sem classes globais conflitantes)
- Customizacao de tokens via configuracao (mapeia exatamente o DS)
- Purge automatico (bundle menor)
- Tailwind v4 com CSS-first config e melhor DX

Os **tokens** (cores, tipografia, espacamento, border-radius) sao extraidos do DS e mapeados no Tailwind. O `design-system.html` serve como **referencia visual**, nao como biblioteca de codigo.

### Anti-Corruption Layer

Toda comunicacao com Strapi passa por `lib/strapi/`. Componentes React nunca acessam a API diretamente. Isso garante:
- **Desacoplamento**: trocar Strapi por outro CMS requer mudar apenas `lib/strapi/`
- **Tipagem segura**: dados transformados em tipos proprios do projeto
- **Testabilidade**: mock client para desenvolvimento sem Strapi
- **Resilience**: fallbacks centralizados quando a API falha

Ver detalhes em [INTEGRATION-PATTERNS.md](./INTEGRATION-PATTERNS.md).

## Camadas do Sistema

| Camada | Responsabilidade | Localização |
|---|---|---|
| **Pages** | Routing, SEO metadata, layout composition | `front/app/` |
| **Components** | UI reutilizavel, apresentacao visual | `front/app/components/` |
| **Services** | Logica de negocio, transformacao de dados | `front/lib/` |
| **Strapi Client** | Anti-corruption layer, comunicacao com CMS | `front/lib/strapi/` |
| **Design System** | Tokens visuais, referencia de componentes | `site/design-system.html` |

## Estrutura de Pastas

```
front/
├── app/
│   ├── layout.tsx                # Root layout (Poppins, metadata global)
│   ├── page.tsx                  # Home
│   ├── blog/
│   │   ├── page.tsx              # Blog listing (ISR)
│   │   └── [slug]/page.tsx       # Blog post (ISR)
│   └── components/
│       ├── ui/                   # Button, Card, Input, Accordion...
│       ├── layout/               # Header, Footer, Navigation
│       └── blog/                 # PostCard, CategoryBadge, SearchBar...
├── lib/
│   ├── strapi/
│   │   ├── client.ts             # Funcoes publicas (getPosts, getPage...)
│   │   ├── types.ts              # Post, Page, Category, Menu
│   │   ├── api/                  # Chamadas REST/GraphQL (interno)
│   │   └── transformers.ts       # Dados Strapi → tipos limpos
│   └── utils/                    # Helpers genericos
├── public/                       # Assets estaticos
├── next.config.ts
├── tailwind.config.ts            # Tokens do Design System
└── tsconfig.json
```

## Decision Tree: Qual Doc Ler

**IF** entendendo a arquitetura geral → voce esta aqui
**IF** implementando componentes, pages, ou services → leia [CODING-PATTERNS.md](./CODING-PATTERNS.md)
**IF** integrando com Strapi ou APIs externas → leia [INTEGRATION-PATTERNS.md](./INTEGRATION-PATTERNS.md)
**IF** checklist antes de commitar ou iniciar feature → leia [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md)
**IF** implementando algo visual → consulte `site/design-system.html` e a rule `design-system.mdc`
**IF** otimizando PageSpeed / Core Web Vitals → leia [PAGESPEED-PERFORMANCE.md](./PAGESPEED-PERFORMANCE.md)

## Design System

O Design System (`site/design-system.html`) e **lei** para toda implementacao visual. Consulte-o sempre ao criar ou modificar componentes. Os tokens estao documentados na rule `.cursor/rules/design-system.mdc`.

---

**Last Updated**: Fevereiro 2026
