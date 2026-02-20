/**
 * Chamadas REST ao Strapi — menus (header/footer).
 * Uso interno da ACL; componentes nunca importam daqui.
 * Busca todos os menus e filtra por slug no código (compatível com Strapi v5 Cloud).
 */

const STRAPI_API_URL = (process.env.STRAPI_API_URL ?? '').replace(/\/$/, '');
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN ?? '';

/** Strapi v5.36: endpoint padrão do content-type Menu é /api/menus. */
const MENUS_PATH = '/api/menus';

/** Headers iguais ao Postman para o gateway/Cloud não devolver 404 em requisições server-side. */
const STRAPI_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  Authorization: `Bearer ${STRAPI_API_TOKEN}`,
  'Content-Type': 'application/json',
  'Strapi-Response-Format': 'v4',
  'User-Agent': 'NextJS-Strapi-Client/1.0',
};

/** Strapi v5: populate usa índices (populate[0], populate[1]). "items,items.children" gera "Invalid key items,items". */
const MENUS_QUERY =
  'pagination[pageSize]=10&populate[0]=items&populate[1]=items.children';

export async function fetchAllMenusFromStrapi(): Promise<StrapiMenuResponse[]> {
  const url = `${STRAPI_API_URL}${MENUS_PATH}?${MENUS_QUERY}`;
  const response = await fetch(url, {
    headers: STRAPI_HEADERS,
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    const body = await response.text();
    let detail = body;
    try {
      const parsed = JSON.parse(body) as { error?: { message?: string }; message?: string };
      detail = parsed.error?.message ?? parsed.message ?? body;
    } catch {
      detail = body.slice(0, 200);
    }
    throw new Error(`Strapi API error: ${response.status}. ${detail}`);
  }
  const json = (await response.json()) as { data?: StrapiMenuResponse[] };
  const list = json.data ?? [];
  return Array.isArray(list) ? list : [];
}

export async function fetchMenuBySlug(slug: string): Promise<StrapiMenuResponse | null> {
  const list = await fetchAllMenusFromStrapi();
  const slugLower = slug.toLowerCase();
  return (
    list.find((m) => (m.attributes?.slug ?? m.slug ?? '').toLowerCase() === slugLower) ?? null
  );
}

/** Item no formato JSON (legado) ou componente Strapi (documentId, label, url, children). */
export type StrapiMenuItemRaw = {
  id?: number;
  documentId?: string;
  label?: string;
  url?: string;
  children?: StrapiMenuItemRaw[];
};

/** Resposta do Menu: v4 (attributes) ou v5 (campos no topo). */
export interface StrapiMenuResponse {
  id?: number;
  documentId?: string;
  slug?: string;
  attributes?: {
    slug?: string;
    items?: StrapiMenuItemRaw[];
  };
  items?: StrapiMenuItemRaw[];
}
