import Link from 'next/link';
import { getPosts } from '@/lib/strapi/client';
import { PostList } from '@/app/components/blog/PostList';

export const revalidate = 60;

export default async function HomePage() {
  const posts = await getPosts({ limit: 6 });

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-[1320px] px-6">
        <section className="mb-16 text-center">
          <h1 className="text-3xl font-bold text-[#001e27] md:text-4xl">
            Sistema de Gestão ERP Online
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#001e27]/80">
            Para PMEs e grandes empresas. Conteúdo institucional e blog geridos pelo Strapi.
          </p>
          <Link
            href="/blog"
            className="mt-6 inline-block rounded-[40px] border-[3px] border-[#00e2f4] bg-[#00e2f4] px-6 py-2.5 font-bold text-[#001e27] transition-all duration-200 hover:shadow-[0_6px_0_0_rgba(0,226,244,.6)]"
          >
            Ver blog
          </Link>
        </section>

        <section>
          <h2 className="mb-8 inline-block border-b-[3px] border-[#00e2f4] text-2xl font-bold text-[#001e27]">
            Últimos posts
          </h2>
          <PostList posts={posts} />
        </section>
      </div>
    </div>
  );
}
