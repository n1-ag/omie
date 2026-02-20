/**
 * Tipos do domínio OMIE — não refletem a estrutura do Strapi.
 * Componentes usam apenas estes tipos.
 */

export interface SeoData {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  /** ISO 8601 date for structured data (Article) */
  publishedAtIso: string;
  featuredImage: string;
  category: string;
  categorySlug: string;
  author: string;
  seo?: SeoData;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage?: string;
  seo?: SeoData;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  children?: MenuItem[];
}

export interface Menu {
  id: string;
  items: MenuItem[];
}

export interface Menus {
  header: MenuItem[];
  footer: MenuItem[];
}

export interface PostListOptions {
  limit?: number;
  category?: string;
  search?: string;
  start?: number;
}

/**
 * JSON externalizado do componente "Dados estruturados — Organization" no Strapi.
 * Aceita formato simples { name, url, sameAs } ou JSON-LD completo com @graph.
 */
export type OrganizationJson =
  | { name?: string; url?: string; sameAs?: string[] }
  | { '@context': string; '@graph'?: unknown[]; '@type'?: string; [key: string]: unknown };

export interface SiteConfig {
  siteTitle: string;
  siteDescription: string;
  logo: string;
  logoAlt: string;
  favicon: string;
  ogImage: string;
  ga4MeasurementId: string;
  gtmContainerId: string;
  gscVerification: string;
  /** JSON do schema Organization (name, url, sameAs) — componente no Strapi. */
  organizationJson?: OrganizationJson;
}
