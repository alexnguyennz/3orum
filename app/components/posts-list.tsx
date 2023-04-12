import PostItem from "~/components/post-item";
import PostSort from "~/components/post-sort";

import type { Post } from "~/types";

export default function PostsList({
  posts,
  sort,
}: {
  posts: Post[];
  sort: string;
}) {
  return (
    <main className="space-y-5">
      {posts.length > 0 && <PostSort sort={sort} />}
      <ul className="posts-list">
        {posts.length ? (
          posts.map((post) => <PostItem post={post} key={post.id} />)
        ) : (
          <span>It looks like there are no discussions here.</span>
        )}
      </ul>
    </main>
  );
}
