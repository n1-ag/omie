import { getPosts, getSiteConfig } from '@/lib/strapi/client';
import { PostList } from '@/app/components/blog/PostList';
import { buildMetadataFromSeo, getSiteBaseUrl } from '@/lib/seo/metadata';

export const revalidate = 60;

export async function generateMetadata() {
  const siteConfig = await getSiteConfig();
  const baseUrl = getSiteBaseUrl();
  return buildMetadataFromSeo(undefined, siteConfig, {
    pageTitle: 'Blog',
    url: baseUrl ? `${baseUrl}/blog` : '',
  });
}

export default async function BlogPage() {
  const posts = await getPosts({ limit: 12 });

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-[1320px] px-6">
        <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
          Blog OMIE
        </h1>
        <p className="mb-12 text-foreground/70">
          Conteúdos sobre gestão, contabilidade e tecnologia para empresas.
        </p>
        <PostList posts={posts} />
      </div>
    </div>
  );
}
