/**
 * Mock client para desenvolvimento sem Strapi rodando.
 * Ativar com STRAPI_MOCK=true no .env.local.
 */

import type { Post, Page, MenuItem, SiteConfig } from './types';

const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Como escolher o melhor ERP para sua empresa',
    slug: 'como-escolher-erp',
    excerpt: 'Descubra os critérios essenciais para escolher o ERP ideal.',
    content: '<p>Conteúdo completo do post...</p>',
    date: '16 de fevereiro de 2026',
    publishedAtIso: '2026-02-16T12:00:00.000Z',
    featuredImage: '',
    category: 'Contabilidade Empresarial',
    categorySlug: 'contabilidade',
    author: 'OMIE',
  },
  {
    id: '2',
    title: 'Gestão financeira para PMEs',
    slug: 'gestao-financeira-pmes',
    excerpt: 'Dicas práticas para organizar as finanças da sua empresa.',
    content: '<p>Conteúdo do post...</p>',
    date: '15 de fevereiro de 2026',
    publishedAtIso: '2026-02-15T12:00:00.000Z',
    featuredImage: '',
    category: 'Gestão',
    categorySlug: 'gestao',
    author: 'OMIE',
  },
];

const mockMenuItems: MenuItem[] = [
  { id: '1', label: 'Início', url: '/' },
  { id: '2', label: 'Blog', url: '/blog' },
  { id: '3', label: 'Sobre', url: '/sobre' },
];

export async function getPostsMock(): Promise<Post[]> {
  await new Promise((r) => setTimeout(r, 200));
  return mockPosts;
}

export async function getPostMock(slug: string): Promise<Post | null> {
  await new Promise((r) => setTimeout(r, 100));
  return mockPosts.find((p) => p.slug === slug) ?? null;
}

export async function getPostSlugsMock(): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 100));
  return mockPosts.map((p) => p.slug);
}

export async function getPageMock(_slug: string): Promise<Page | null> {
  await new Promise((r) => setTimeout(r, 100));
  return null;
}

export async function getMenusMock(): Promise<{ header: MenuItem[]; footer: MenuItem[] }> {
  await new Promise((r) => setTimeout(r, 100));
  return {
    header: mockMenuItems,
    footer: [...mockMenuItems, { id: '4', label: 'Contato', url: '/contato' }],
  };
}

const defaultSiteConfig: SiteConfig = {
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
  organizationJson: {
    name: 'Omie',
    url: 'https://www.omie.com.br/',
    sameAs: [
      'https://www.linkedin.com/company/omie',
      'https://www.facebook.com/omieoficial',
      'https://www.instagram.com/omieoficial',
      'https://www.youtube.com/user/omiexperience',
      'https://blog.omie.com.br',
    ],
  },
};

export async function getSiteConfigMock(): Promise<SiteConfig> {
  await new Promise((r) => setTimeout(r, 80));
  return { ...defaultSiteConfig };
}
