import { useRouteLoaderData } from "@remix-run/react";

import PostItem from "~/components/post-item";
import type { Post } from "~/types";

export default function UserDiscussions() {
  /**
   * Issue: https://github.com/remix-run/remix/pull/5157
   */
  const { discussions }: any = useRouteLoaderData("routes/u");

  return (
    <ul className="posts-list">
      {discussions.length ? (
        discussions.map((post: Post) => <PostItem post={post} key={post.id} />)
      ) : (
        <span>It looks like there are no discussions here.</span>
      )}
    </ul>
  );
}
