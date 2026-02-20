/**
 * Funções para gerar JSON-LD (dados estruturados) para SEO.
 * Schemas: Organization, WebSite, Article, BreadcrumbList.
 */

import type { SiteConfig } from '@/lib/strapi/types';
import type { Post } from '@/lib/strapi/types';
import { getSiteBaseUrl } from './metadata';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Verifica se o JSON é um JSON-LD completo (@context + @graph ou @type).
 * Se sim, pode ser usado diretamente no script.
 */
/**
 * Extrai o nome da organização para Article/outros schemas.
 * Funciona com formato simples { name } ou @graph completo.
 */
export function getOrganizationName(config: SiteConfig): string {
  const raw = config.organizationJson as Record<string, unknown> | undefined;
  if (!raw) return config.siteTitle;
  if (typeof (raw as { name?: string }).name === 'string') return (raw as { name: string }).name;
  const graph = raw['@graph'] as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(graph)) {
    const org = graph.find((n) => n['@type'] === 'Organization');
    if (org && typeof org.name === 'string') return org.name;
  }
  return config.siteTitle;
}

function isCompleteJsonLd(obj: unknown): obj is { '@context': string; '@graph'?: unknown[]; '@type'?: string } {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return typeof o['@context'] === 'string' && (Array.isArray(o['@graph']) || typeof o['@type'] === 'string');
}

/**
 * Retorna o(s) JSON-LD para Organization e WebSite.
 * Se organizationJson tiver @context e @graph (ou @type), usa diretamente.
 * Caso contrário, constrói a partir do formato simples { name, url, sameAs }.
 */
export function getOrganizationAndWebSiteJsonLd(config: SiteConfig): object[] {
  const raw = config.organizationJson as Record<string, unknown> | undefined;
  if (raw && isCompleteJsonLd(raw)) {
    return [raw];
  }
  const org = config.organizationJson as { name?: string; url?: string; sameAs?: string[] } | undefined;
  const url = org?.url || getSiteBaseUrl();
  const sameAs = Array.isArray(org?.sameAs) ? org.sameAs.filter(Boolean) : [];

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org?.name || config.siteTitle,
    url: url || undefined,
    ...(config.logo && { logo: config.logo }),
    ...(sameAs.length > 0 && { sameAs }),
  };

  if (!url) return [organizationJsonLd];

  const webSiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.siteTitle,
    url,
    description: config.siteDescription || undefined,
    publisher: {
      '@type': 'Organization',
      name: org?.name || config.siteTitle,
      ...(config.logo && { logo: config.logo }),
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return [organizationJsonLd, webSiteJsonLd];
}

/**
 * Schema Article — post do blog.
 * Uso: página de post individual.
 */
export function getArticleJsonLd(
  post: Post,
  config: SiteConfig,
  postUrl: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.featuredImage || undefined,
    datePublished: post.publishedAtIso || undefined,
    author: {
      '@type': 'Person',
      name: post.author || getOrganizationName(config),
    },
    publisher: {
      '@type': 'Organization',
      name: getOrganizationName(config),
      logo: config.logo
        ? {
            '@type': 'ImageObject',
            url: config.logo,
          }
        : undefined,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
  };
}

/**
 * Schema BreadcrumbList — navegação em migalhas.
 * Uso: post do blog, páginas institucionais.
 */
export function getBreadcrumbJsonLd(items: BreadcrumbItem[]): object {
  if (items.length === 0) return {};

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
