import { useLoaderData } from "@remix-run/react";
import { json, type LoaderArgs } from "@remix-run/node";

import { polybase } from "~/root";

import PostsList from "~/components/posts-list";

import { getDiscussionsFromPosts, sortDiscussions } from "~/utils/post-sort";

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

  let discussions = getDiscussionsFromPosts(posts);

  discussions = sortDiscussions(discussions, sort);

  return json({ discussions, sort });
}

export default function Tag() {
  const { discussions, sort } = useLoaderData<typeof loader>();

  return <PostsList posts={discussions} sort={sort} />;
}
