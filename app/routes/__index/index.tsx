import { useLoaderData } from "@remix-run/react";
import { json, type LoaderArgs } from "@remix-run/node";

import { type CollectionRecordResponse } from "@polybase/client";
import { polybase } from "~/root";

import PostsList from "~/components/posts-list";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const sort = url.searchParams.get("sort");

  let filter: "desc" | "asc" = "desc";
  if (sort === "oldest") {
    filter = "asc";
  }

  const { data: posts } = await polybase
    .collection("Post")
    .sort("timestamp", filter)
    .get();

  // query workaround - filter out all posts for only discussions
  const discussions = posts.filter((post) => !post.data.discussion);

  return json({ discussions });
}

export default function Index() {
  const { discussions } = useLoaderData<typeof loader>() as {
    discussions: CollectionRecordResponse<any>[];
  };

  return <PostsList posts={discussions} />;
}
