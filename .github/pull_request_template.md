# 📋 Pull Request

## 📝 Descrição

<!-- Descreva o que foi alterado e o motivo. Seja objetivo. -->

---

## 🏷️ Tipo de mudança

- [ ] ✨ `feat` — Nova funcionalidade
- [ ] 🐛 `fix` — Correção de bug
- [ ] 📚 `docs` — Alteração em documentação
- [ ] 🔧 `refactor` — Refatoração (sem mudança de comportamento)
- [ ] 💄 `style` — Ajuste de estilo (formato, lint, etc.)
- [ ] 🧹 `chore` — Manutenção, configuração, deps
- [ ] ⚡ `perf` — Melhoria de performance

---

## 📂 Áreas afetadas

- [ ] `front/` — Next.js (App Router, componentes, lib)
- [ ] `cms/` — Strapi (content-types, controllers, services)
- [ ] `docs/` — Documentação de arquitetura
- [ ] Outro: ___

---

## 🔗 Issue relacionada

<!-- Ex.: Fixes #123 ou Relacionado a #456 -->

---

## ✅ Checklist

### 🛠️ Build e Lint

- [ ] `cd front && npm run build` — passa sem erros
- [ ] `cd front && npm run lint` — passa sem warnings/erros
- [ ] `cd cms && npm run build` — passa sem erros *(se alterou o CMS)*

### 💻 Código *(ver [IMPLEMENTATION-CHECKLIST.md](docs/IMPLEMENTATION-CHECKLIST.md))*

- [ ] Sem `any` em tipos/props
- [ ] Componentes só importam de `lib/*/client.ts` e `lib/*/types.ts` *(anti-corruption layer)*
- [ ] Sem `fetch` direto para Strapi em componentes
- [ ] URLs e tokens em variáveis de ambiente *(nunca hardcoded)*
- [ ] Sem `'use client'` desnecessário *(Server Component por padrão)*

### 🎨 Visual *(se houver alteração de UI)*

- [ ] Componentes consultam `site/design-system.html` e seguem os tokens
- [ ] Variáveis de cor utilizadas *(text-foreground, bg-ciano, etc.)* — sem hex direto
- [ ] Tailwind classes utilizadas *(sem `style` inline)*
- [ ] Responsivo testado *(mobile, tablet, desktop)*
- [ ] Screenshots ou GIFs anexados abaixo *(quando aplicável)*

### 🔌 Integração *(se houver nova API ou alteração em `lib/strapi/`)*

- [ ] Nova pasta em `lib/<nome>/` com client, types e transformers
- [ ] Timeout e tratamento de erro configurados
- [ ] Variáveis de ambiente documentadas em `.env.example`

---

## 📸 Screenshots / Preview

<!-- Anexe imagens ou GIFs quando houver mudanças visuais. -->

---

## 📌 Notas adicionais

<!-- Considerações para reviewers, breaking changes, migrações, etc. -->
