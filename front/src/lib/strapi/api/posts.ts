/**
 * Chamadas REST ao Strapi — posts.
 * Uso interno da ACL; componentes nunca importam daqui.
 */

import type { PostListOptions } from '../types';

const STRAPI_API_URL = process.env.STRAPI_API_URL ?? '';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN ?? '';

export async function fetchPostsFromStrapi(
  options?: PostListOptions
): Promise<StrapiPostResponse[]> {
  const params = new URLSearchParams({
    'pagination[limit]': String(options?.limit ?? 10),
    'pagination[start]': String(options?.start ?? 0),
    populate: 'featuredImage,category,author',
  });
  if (options?.category) {
    params.set('filters[category][slug][$eq]', options.category);
  }
  if (options?.search) {
    params.set('filters[$or][0][title][$containsi]', options.search);
    params.set('filters[$or][1][excerpt][$containsi]', options.search);
  }

  const response = await fetch(`${STRAPI_API_URL}/api/posts?${params}`, {
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status}`);
  }

  const json = (await response.json()) as { data?: StrapiPostResponse[] };
  return json.data ?? [];
}

export async function fetchPostBySlug(slug: string): Promise<StrapiPostResponse | null> {
  const params = new URLSearchParams({
    'filters[slug][$eq]': slug,
    populate: 'featuredImage,category,author',
  });

  const response = await fetch(`${STRAPI_API_URL}/api/posts?${params}`, {
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status}`);
  }

  const json = (await response.json()) as { data?: StrapiPostResponse[] };
  const item = json.data?.[0] ?? null;
  return item;
}

export async function fetchAllPostSlugs(): Promise<string[]> {
  const params = new URLSearchParams({
    'pagination[limit]': '100',
    fields: 'slug',
  });

  const response = await fetch(`${STRAPI_API_URL}/api/posts?${params}`, {
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status}`);
  }

  const json = (await response.json()) as { data?: { id: number; attributes?: { slug?: string } }[] };
  const items = json.data ?? [];
  return items
    .map((p) => p.attributes?.slug)
    .filter((s): s is string => Boolean(s));
}

/** Resposta bruta do Strapi (v4 style); ajustar conforme seu Strapi. */
export interface StrapiPostResponse {
  id: number;
  attributes?: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    publishedAt?: string;
    createdAt?: string;
    featuredImage?: {
      data?: { attributes?: { url?: string } };
    };
    category?: {
      data?: { attributes?: { name?: string; slug?: string } };
    };
    author?: {
      data?: { attributes?: { name?: string } };
    };
  };
}
