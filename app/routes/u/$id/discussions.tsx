import { useRouteLoaderData } from "@remix-run/react";

import PostItem from "~/components/post-item";
import type { Posts } from "~/types";

export default function UserDiscussions() {
  const { discussions }: any = useRouteLoaderData("routes/u"); // https://github.com/remix-run/remix/pull/5157

  return (
    <ul className="posts-list">
      {discussions.length ? (
        discussions.map(({ data }: Posts) => (
          <PostItem post={data} key={data.id} />
        ))
      ) : (
        <span>It looks like there are no discussions here.</span>
      )}
    </ul>
  );
}
