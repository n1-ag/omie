/**
 * Converte resposta bruta do Strapi em tipos do domínio.
 */

import type { Post } from './types';
import type { StrapiPostResponse } from './api/posts';
import type { StrapiPageResponse } from './api/pages';
import type { StrapiMenuResponse, StrapiMenuItemRaw } from './api/menus';
import type { Page, MenuItem } from './types';

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function resolveMediaUrl(
  data: { data?: { attributes?: { url?: string } } } | undefined
): string {
  const url = data?.data?.attributes?.url;
  if (!url) return '';
  const base = process.env.STRAPI_API_URL ?? '';
  return url.startsWith('http') ? url : `${base}${url}`;
}

export function transformPost(raw: StrapiPostResponse): Post {
  const attrs = raw.attributes ?? {};
  return {
    id: String(raw.id),
    title: attrs.title ?? '',
    slug: attrs.slug ?? '',
    excerpt: stripHtmlTags(attrs.excerpt ?? ''),
    content: attrs.content ?? '',
    date: formatDate(attrs.publishedAt ?? attrs.createdAt ?? ''),
    featuredImage: resolveMediaUrl(attrs.featuredImage),
    category: attrs.category?.data?.attributes?.name ?? '',
    categorySlug: attrs.category?.data?.attributes?.slug ?? '',
    author: attrs.author?.data?.attributes?.name ?? 'OMIE',
  };
}

export function transformPage(raw: StrapiPageResponse): Page {
  const attrs = raw.attributes ?? {};
  return {
    id: String(raw.id),
    title: attrs.title ?? '',
    slug: attrs.slug ?? '',
    content: attrs.content ?? '',
    featuredImage: resolveMediaUrl(attrs.featuredImage),
  };
}

function transformMenuItem(item: StrapiMenuItemRaw): MenuItem {
  const id = item.documentId ?? String(item.id ?? '');
  return {
    id: id || String(Math.random()),
    label: item.label ?? '',
    url: item.url ?? '#',
    children: item.children?.length ? item.children.map(transformMenuItem) : undefined,
  };
}

function getMenuItems(raw: StrapiMenuResponse | null): StrapiMenuItemRaw[] | undefined {
  if (!raw) return undefined;
  const items = raw.items ?? raw.attributes?.items;
  return Array.isArray(items) && items.length > 0 ? items : undefined;
}

export function transformMenu(raw: StrapiMenuResponse | null): MenuItem[] {
  const items = getMenuItems(raw);
  if (!items) return [];
  return items.map(transformMenuItem);
}
