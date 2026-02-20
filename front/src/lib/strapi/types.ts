/**
 * Tipos do domínio OMIE — não refletem a estrutura do Strapi.
 * Componentes usam apenas estes tipos.
 */

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  featuredImage: string;
  category: string;
  categorySlug: string;
  author: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage?: string;
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
