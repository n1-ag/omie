import { PostCard } from './PostCard';
import type { Post } from '@/lib/strapi/types';

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <p className="py-12 text-center text-[#001e27]/70">
        Nenhum post encontrado no momento.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" role="list">
      {posts.map((post) => (
        <li key={post.id}>
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  );
}
