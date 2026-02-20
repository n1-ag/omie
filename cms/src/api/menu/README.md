# Content-type: Menu

Menus de navegação (header, footer). Endpoint REST: `GET /api/menus`.

## Estrutura obrigatória

No Strapi, content-types precisam de **controllers**, **routes** e **services** além do schema, senão as rotas REST não são registradas e o content-type **não aparece** em Settings → API Tokens → Token permissions.

Este content-type inclui:
- `controllers/menu.ts` — createCoreController
- `routes/menu.ts` — createCoreRouter
- `services/menu.ts` — createCoreService

## Permissões obrigatórias

Depois de reiniciar o Strapi com a estrutura acima, em **Settings → API Tokens** → editar o token, expanda **Users-permissions**. Os content-types (Menu, Post, Page, Category) aparecem ali. Marque para **Menu**:
- `find` (lista de menus)
- `findOne` (um menu por id/documentId)

Sem isso, a API responde **404** para `/api/menus`. Ver também `README-PROJETO.md` na raiz do repositório.
