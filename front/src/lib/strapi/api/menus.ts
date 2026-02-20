/**
 * Chamadas REST ao Strapi — menus (header/footer).
 * Uso interno da ACL; componentes nunca importam daqui.
 */

const STRAPI_API_URL = process.env.STRAPI_API_URL ?? '';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN ?? '';

export async function fetchMenuBySlug(slug: string): Promise<StrapiMenuResponse | null> {
  const params = new URLSearchParams({
    'filters[slug][$eq]': slug,
    populate: 'items,items.children,items.children.children',
  });

  const response = await fetch(`${STRAPI_API_URL}/api/menus?${params}`, {
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status}`);
  }

  const json = (await response.json()) as { data?: StrapiMenuResponse[] };
  return json.data?.[0] ?? null;
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
