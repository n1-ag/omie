import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getPost, getPostSlugs } from '@/lib/strapi/client';

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
  const post = await getPost(slug);
  if (!post) return { title: 'Post não encontrado' };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="section-padding">
      <div className="mx-auto max-w-[1320px] px-6">
        <header className="mb-8">
          <span className="text-xs font-semibold uppercase text-[#6EC1E4]">
            {post.category}
          </span>
          <time className="mt-1 block text-sm text-[#001e27]/60" dateTime={post.date}>
            {post.date}
          </time>
          <h1 className="mt-4 text-3xl font-bold text-[#001e27] md:text-4xl">
            {post.title}
          </h1>
          {post.author && (
            <p className="mt-2 text-sm text-[#001e27]/70">Por {post.author}</p>
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
          className="prose prose-lg max-w-none text-[#001e27] prose-headings:text-[#001e27] prose-a:text-[#00e2f4]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}
