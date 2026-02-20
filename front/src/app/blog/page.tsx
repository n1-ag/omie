import { getPosts } from '@/lib/strapi/client';
import { PostList } from '@/app/components/blog/PostList';

export const revalidate = 60;

export const metadata = {
  title: 'Blog',
  description: 'Artigos e conteúdos sobre gestão, contabilidade e ERP para sua empresa.',
};

export default async function BlogPage() {
  const posts = await getPosts({ limit: 12 });

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-[1320px] px-6">
        <h1 className="mb-2 text-3xl font-bold text-[#001e27] md:text-4xl">
          Blog OMIE
        </h1>
        <p className="mb-12 text-[#001e27]/70">
          Conteúdos sobre gestão, contabilidade e tecnologia para empresas.
        </p>
        <PostList posts={posts} />
      </div>
    </div>
  );
}
