/**
 * Chamadas REST ao Strapi — páginas.
 * Uso interno da ACL; componentes nunca importam daqui.
 */

const STRAPI_API_URL = (process.env.STRAPI_API_URL ?? '').replace(/\/$/, '');
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN ?? '';

export async function fetchPageBySlug(slug: string): Promise<StrapiPageResponse | null> {
  const params = new URLSearchParams({
    'filters[slug][$eq]': slug,
    populate: 'featuredImage',
  });

  const response = await fetch(`${STRAPI_API_URL}/api/pages?${params}`, {
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      'Strapi-Response-Format': 'v4',
    },
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status}`);
  }

  const json = (await response.json()) as { data?: StrapiPageResponse[] };
  const item = json.data?.[0] ?? null;
  return item;
}

export interface StrapiPageResponse {
  id: number;
  attributes?: {
    title?: string;
    slug?: string;
    content?: string;
    featuredImage?: {
      data?: { attributes?: { url?: string } };
    };
  };
}
