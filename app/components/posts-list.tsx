import PostItem from "~/components/post-item";
import PostSort from "~/components/post-sort";

import type { Posts } from "~/types";

export default function PostsList({ posts }: { posts: Posts[] }) {
  return (
    <main className="space-y-5">
      {posts.length > 0 && <PostSort />}
      <ul className="posts-list">
        {posts.length ? (
          posts.map(({ data: post }) => <PostItem post={post} key={post.id} />)
        ) : (
          <span>It looks like there are no discussions here.</span>
        )}
      </ul>
    </main>
  );
}
