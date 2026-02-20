/**
 * Converte resposta bruta do Strapi em tipos do domínio.
 */

import type { Post, Page, MenuItem, SiteConfig, SeoData } from './types';
import type { StrapiPostResponse } from './api/posts';
import type { StrapiPageResponse } from './api/pages';
import type { StrapiMenuResponse, StrapiMenuItemRaw } from './api/menus';
import type { StrapiSiteConfigResponse } from './api/site-config';

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

function transformSeo(
  raw: { metaTitle?: string; metaDescription?: string; canonicalUrl?: string; noindex?: boolean } | undefined
): SeoData | undefined {
  if (!raw) return undefined;
  const hasContent =
    (raw.metaTitle && raw.metaTitle.trim()) ||
    (raw.metaDescription && raw.metaDescription.trim()) ||
    (raw.canonicalUrl && raw.canonicalUrl.trim()) ||
    raw.noindex === true;
  if (!hasContent) return undefined;
  return {
    metaTitle: raw.metaTitle?.trim() || undefined,
    metaDescription: raw.metaDescription?.trim() || undefined,
    canonicalUrl: raw.canonicalUrl?.trim() || undefined,
    noindex: raw.noindex ?? false,
  };
}

function resolveMediaUrl(
  data: { data?: { attributes?: { url?: string } } } | undefined
): string {
  const url = data?.data?.attributes?.url;
  if (!url) return '';
  const base = (process.env.STRAPI_API_URL ?? '').replace(/\/$/, '');
  return url.startsWith('http') ? url : `${base}${url}`;
}

export function transformPost(raw: StrapiPostResponse): Post {
  const attrs = raw.attributes ?? {};
  const rawDate = attrs.publishedAt ?? attrs.createdAt ?? '';
  return {
    id: String(raw.id),
    title: attrs.title ?? '',
    slug: attrs.slug ?? '',
    excerpt: stripHtmlTags(attrs.excerpt ?? ''),
    content: attrs.content ?? '',
    date: formatDate(rawDate),
    publishedAtIso: rawDate || new Date().toISOString(),
    featuredImage: resolveMediaUrl(attrs.featuredImage),
    category: attrs.category?.data?.attributes?.name ?? '',
    categorySlug: attrs.category?.data?.attributes?.slug ?? '',
    author:
      typeof attrs.author === 'string'
        ? attrs.author
        : (attrs.author as { data?: { attributes?: { name?: string } } } | undefined)?.data?.attributes?.name ?? 'OMIE',
    seo: transformSeo(attrs.seo),
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
    seo: transformSeo(attrs.seo),
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

const DEFAULT_ORGANIZATION_JSON = {
  name: 'Omie',
  url: 'https://www.omie.com.br/',
  sameAs: [
    'https://www.linkedin.com/company/omie',
    'https://www.facebook.com/omieoficial',
    'https://www.instagram.com/omieoficial',
    'https://www.youtube.com/user/omiexperience',
    'https://blog.omie.com.br',
  ],
};

const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteTitle: 'OMIE | Sistema de Gestão ERP Online',
  siteDescription:
    'Sistema de gestão ERP online para PMEs e grandes empresas. Contabilidade, financeiro e mais.',
  logo: '',
  logoAlt: 'OMIE - Sistema de Gestão ERP',
  favicon: '',
  ogImage: '',
  ga4MeasurementId: '',
  gtmContainerId: '',
  gscVerification: '',
  organizationJson: DEFAULT_ORGANIZATION_JSON,
};

export function transformSiteConfig(
  raw: StrapiSiteConfigResponse | null
): SiteConfig {
  if (!raw) return { ...DEFAULT_SITE_CONFIG };

  const attrs = raw.attributes ?? raw;
  const getMedia = (media: unknown): string => {
    const m = media as { data?: { attributes?: { url?: string } } } | undefined;
    const url = m?.data?.attributes?.url;
    if (!url) return '';
    const base = (process.env.STRAPI_API_URL ?? '').replace(/\/$/, '');
    return url.startsWith('http') ? url : `${base}${url}`;
  };

  return {
    siteTitle: attrs.titulo ?? raw.titulo ?? DEFAULT_SITE_CONFIG.siteTitle,
    siteDescription:
      attrs.descricao ?? raw.descricao ?? DEFAULT_SITE_CONFIG.siteDescription,
    logo: getMedia(attrs.logo ?? raw.logo),
    logoAlt:
      attrs.textoAlternativoLogo ??
      raw.textoAlternativoLogo ??
      DEFAULT_SITE_CONFIG.logoAlt,
    favicon: getMedia(attrs.favicon ?? raw.favicon),
    ogImage: getMedia(attrs.imagemRedesSociais ?? raw.imagemRedesSociais),
    ga4MeasurementId:
      attrs.codigoGoogleAnalytics ?? raw.codigoGoogleAnalytics ?? '',
    gtmContainerId:
      attrs.codigoGoogleTagManager ?? raw.codigoGoogleTagManager ?? '',
    gscVerification:
      attrs.codigoVerificacaoGoogle ?? raw.codigoVerificacaoGoogle ?? '',
    organizationJson: parseOrganizationJson(
      attrs.organizationStructuredData ?? raw.organizationStructuredData
    ),
  };
}

function parseOrganizationJson(
  raw: { organizationJson?: unknown } | undefined
): SiteConfig['organizationJson'] {
  const json = raw?.organizationJson;
  if (!json || typeof json !== 'object') return DEFAULT_ORGANIZATION_JSON;
  const obj = json as Record<string, unknown>;
  if (obj['@context'] && (Array.isArray(obj['@graph']) || obj['@type'])) {
    return obj as SiteConfig['organizationJson'];
  }
  return {
    name: typeof obj.name === 'string' ? obj.name : DEFAULT_ORGANIZATION_JSON.name,
    url: typeof obj.url === 'string' ? obj.url : DEFAULT_ORGANIZATION_JSON.url,
    sameAs: Array.isArray(obj.sameAs)
      ? (obj.sameAs as string[]).filter((s) => typeof s === 'string')
      : DEFAULT_ORGANIZATION_JSON.sameAs,
  };
}
