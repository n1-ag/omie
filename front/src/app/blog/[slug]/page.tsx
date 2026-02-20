import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getPost, getPostSlugs, getSiteConfig } from '@/lib/strapi/client';
import { buildMetadataFromSeo, getSiteBaseUrl } from '@/lib/seo/metadata';
import {
  getArticleJsonLd,
  getBreadcrumbJsonLd,
} from '@/lib/seo/structured-data';
import { StructuredDataScript } from '@/app/components/layout/StructuredDataScript';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [post, siteConfig] = await Promise.all([getPost(slug), getSiteConfig()]);
  if (!post) return { title: { absolute: 'Post não encontrado' } };
  const baseUrl = getSiteBaseUrl();
  return buildMetadataFromSeo(post.seo, siteConfig, {
    pageTitle: post.title,
    url: baseUrl ? `${baseUrl}/blog/${post.slug}` : '',
    image: post.featuredImage || undefined,
  });
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const [post, siteConfig] = await Promise.all([
    getPost(slug),
    getSiteConfig(),
  ]);

  if (!post) {
    notFound();
  }

  const baseUrl = getSiteBaseUrl();
  const postUrl = baseUrl ? `${baseUrl}/blog/${post.slug}` : '';
  const articleJsonLd = getArticleJsonLd(post, siteConfig, postUrl);
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Início', url: baseUrl || '/' },
    { name: 'Blog', url: baseUrl ? `${baseUrl}/blog` : '/blog' },
    { name: post.title, url: postUrl || `/blog/${post.slug}` },
  ]);

  return (
    <>
      <StructuredDataScript data={[articleJsonLd, breadcrumbJsonLd]} />
      <article className="section-padding">
      <div className="mx-auto max-w-[1320px] px-6">
        <header className="mb-8">
          <span className="text-xs font-semibold uppercase text-blog-category">
            {post.category}
          </span>
          <time className="mt-1 block text-sm text-foreground/60" dateTime={post.date}>
            {post.date}
          </time>
          <h1 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">
            {post.title}
          </h1>
          {post.author && (
            <p className="mt-2 text-sm text-foreground/70">Por {post.author}</p>
          )}
        </header>

        {post.featuredImage ? (
          <div className="relative mb-10 aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={post.featuredImage}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 1320px"
            />
          </div>
        ) : null}

        <div
          className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-a:text-ciano"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
    </>
  );
}
