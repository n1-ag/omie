/**
 * Ponto de entrada único da integração Strapi (anti-corruption layer).
 * Componentes importam apenas daqui e de types.ts.
 */

import { fetchPostsFromStrapi, fetchPostBySlug, fetchAllPostSlugs } from './api/posts';
import { fetchPageBySlug } from './api/pages';
import { fetchAllMenusFromStrapi } from './api/menus';
import { transformPost, transformPage, transformMenu } from './transformers';
import type { Post, Page, PostListOptions, Menus } from './types';

const USE_MOCK =
  process.env.STRAPI_MOCK === 'true' || !process.env.STRAPI_API_URL;

async function getPostsFromAPI(options?: PostListOptions): Promise<Post[]> {
  try {
    const rawPosts = await fetchPostsFromStrapi(options);
    return rawPosts.map(transformPost);
  } catch (error) {
    console.error('Failed to fetch posts from Strapi:', error);
    return [];
  }
}

async function getPostFromAPI(slug: string): Promise<Post | null> {
  try {
    const rawPost = await fetchPostBySlug(slug);
    if (!rawPost) return null;
    return transformPost(rawPost);
  } catch (error) {
    console.error('Failed to fetch post from Strapi:', error);
    return null;
  }
}

async function getPostSlugsFromAPI(): Promise<string[]> {
  try {
    return await fetchAllPostSlugs();
  } catch (error) {
    console.error('Failed to fetch post slugs from Strapi:', error);
    return [];
  }
}

async function getPageFromAPI(slug: string): Promise<Page | null> {
  try {
    const raw = await fetchPageBySlug(slug);
    if (!raw) return null;
    return transformPage(raw);
  } catch (error) {
    console.error('Failed to fetch page from Strapi:', error);
    return null;
  }
}

async function getMenusFromAPI(): Promise<Menus> {
  const fallback: Menus = { header: [], footer: [] };
  try {
    const list = await fetchAllMenusFromStrapi();
    const bySlug = (slug: string) =>
      list.find(
        (m) => (m.attributes?.slug ?? m.slug ?? '').toLowerCase() === slug.toLowerCase()
      ) ?? null;
    return {
      header: transformMenu(bySlug('header')),
      footer: transformMenu(bySlug('footer')),
    };
  } catch (error) {
    console.error('Failed to fetch menus from Strapi:', error);
    return fallback;
  }
}

export async function getPosts(options?: PostListOptions): Promise<Post[]> {
  if (USE_MOCK) {
    const { getPostsMock } = await import('./client.mock');
    return getPostsMock();
  }
  return getPostsFromAPI(options);
}

export async function getPost(slug: string): Promise<Post | null> {
  if (USE_MOCK) {
    const { getPostMock } = await import('./client.mock');
    return getPostMock(slug);
  }
  return getPostFromAPI(slug);
}

export async function getPostSlugs(): Promise<string[]> {
  if (USE_MOCK) {
    const { getPostSlugsMock } = await import('./client.mock');
    return getPostSlugsMock();
  }
  return getPostSlugsFromAPI();
}

export async function getPage(slug: string): Promise<Page | null> {
  if (USE_MOCK) {
    const { getPageMock } = await import('./client.mock');
    return getPageMock(slug);
  }
  return getPageFromAPI(slug);
}

export async function getMenus(): Promise<Menus> {
  if (USE_MOCK) {
    const { getMenusMock } = await import('./client.mock');
    return getMenusMock();
  }
  return getMenusFromAPI();
}

export type { Post, Page, Category, MenuItem, Menu, Menus, PostListOptions } from './types';
