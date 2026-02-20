/**
 * Helper para gerar Metadata do Next.js a partir de dados SEO do Strapi.
 * Fallbacks: title = {pageTitle} | OMIE, description = siteConfig.siteDescription.
 */

import type { Metadata } from 'next';
import type { SeoData, SiteConfig } from '@/lib/strapi/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';

export interface MetadataFallbacks {
  pageTitle: string;
  url: string;
  image?: string;
}

/**
 * Constrói metadata para uma página/post usando dados SEO do Strapi.
 * - Title: seo.metaTitle preenchido → usa; senão → {pageTitle} | OMIE
 * - Description: seo.metaDescription preenchido → usa; senão → siteConfig.siteDescription
 * - Canonical: seo.canonicalUrl preenchido → usa; senão → fallbacks.url
 * - Robots: se noindex ativo → index: false, follow: true
 */
export function buildMetadataFromSeo(
  seo: SeoData | undefined,
  siteConfig: SiteConfig,
  fallbacks: MetadataFallbacks
): Metadata {
  const title = seo?.metaTitle?.trim()
    ? seo.metaTitle
    : `${fallbacks.pageTitle} | OMIE`;
  const description =
    seo?.metaDescription?.trim() || siteConfig.siteDescription || undefined;
  const canonical =
    seo?.canonicalUrl?.trim() || fallbacks.url || undefined;

  return {
    title: { absolute: title },
    description: description || undefined,
    ...(canonical && { alternates: { canonical } }),
    ...(seo?.noindex && { robots: { index: false, follow: true } }),
    openGraph: {
      title,
      description: description || undefined,
      url: canonical,
      images: fallbacks.image ? [{ url: fallbacks.image }] : undefined,
      locale: 'pt_BR',
    },
  };
}

/**
 * Retorna a URL base do site (com barra final removida).
 */
export function getSiteBaseUrl(): string {
  return SITE_URL.replace(/\/$/, '');
}
