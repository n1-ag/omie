/**
 * Chamadas REST ao Strapi — menus (header/footer).
 * Uso interno da ACL; componentes nunca importam daqui.
 */

const STRAPI_API_URL = process.env.STRAPI_API_URL ?? '';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN ?? '';

export async function fetchMenuBySlug(slug: string): Promise<StrapiMenuResponse | null> {
  const params = new URLSearchParams({
    'filters[slug][$eq]': slug,
    populate: 'items,items.children',
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

export interface StrapiMenuResponse {
  id: number;
  attributes?: {
    slug?: string;
    items?: Array<{
      id?: number;
      label?: string;
      url?: string;
      children?: Array<{ id?: number; label?: string; url?: string }>;
    }>;
  };
}
