import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/lib/strapi/types';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article
      className="overflow-hidden rounded-lg bg-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
      aria-labelledby={`post-title-${post.id}`}
    >
      {post.featuredImage ? (
        <Link href={`/blog/${post.slug}`} className="block aspect-video w-full overflow-hidden">
          <Image
            src={post.featuredImage}
            alt=""
            width={400}
            height={225}
            className="h-full w-full object-cover"
          />
        </Link>
      ) : (
        <div className="aspect-video w-full bg-cinza-claro" aria-hidden />
      )}
      <div className="border-l-[3px] border-blog-category p-4">
        <span className="text-xs font-semibold uppercase text-blog-category">
          {post.category}
        </span>
        <time className="mt-1 block text-xs text-foreground/60" dateTime={post.date}>
          {post.date}
        </time>
        <h2 id={`post-title-${post.id}`} className="mt-2 text-lg font-bold text-foreground">
          <Link href={`/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{post.excerpt}</p>
      </div>
    </article>
  );
}
