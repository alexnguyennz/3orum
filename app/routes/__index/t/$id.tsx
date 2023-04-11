import { useLoaderData } from "@remix-run/react";
import { json, type LoaderArgs } from "@remix-run/node";

import { polybase } from "~/root";

import PostsList from "~/components/posts-list";

export async function loader({ params, request }: LoaderArgs) {
  const url = new URL(request.url);
  const sort = url.searchParams.get("sort") || "newest";

  const timestampFilter: { [key: string]: "asc" | "desc" } = {
    newest: "desc",
    oldest: "asc",
  };

  const { data: posts } = await polybase
    .collection("Post")
    .where("tag", "==", polybase.collection("Tag").record(params.id!))
    .sort("timestamp", timestampFilter[sort])
    .get();

  // Polybase workaround - filter out all posts for only discussions
  const discussions = posts
    .filter((post) => !post.data.discussion)
    .map(({ data }) => data);

  // group replies into each discussion object
  for (let { data } of posts) {
    if (data.discussion) {
      const index = discussions.findIndex((el) => {
        return el.id === data.discussion.id;
      });

      if (index !== -1) {
        discussions[index].replies = discussions[index].replies ?? [];
        discussions[index].replies.push(data);
      }
    }
  }

  if (sort === "top") {
    discussions.sort((a, b) => b.replies.length - a.replies.length);
  }

  return json({ discussions });
}

export default function Tag() {
  const { discussions } = useLoaderData<typeof loader>();

  return <PostsList posts={discussions} />;
}
