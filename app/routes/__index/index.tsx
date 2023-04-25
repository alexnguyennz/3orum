import { useLoaderData } from "@remix-run/react";
import { json, type LoaderArgs } from "@remix-run/node";

import { polybase } from "~/root";

import PostsList from "~/components/posts-list";

/* Utilities */
import { getDiscussionsFromPosts, sortDiscussions } from "~/utils/post-sort";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const sort = url.searchParams.get("sort") || "newest";
  const q = url.searchParams.get("q");

  const timestampFilter: { [key: string]: "asc" | "desc" } = {
    newest: "desc",
    oldest: "asc",
  };

  const { data: posts } = await polybase
    .collection("Post")
    .sort("timestamp", timestampFilter[sort])
    .get();

  let discussions = getDiscussionsFromPosts(posts);

  discussions = sortDiscussions(discussions, sort);

  // Search - filter discussions and replies
  if (q) {
    discussions = discussions.filter((post) => {
      const content = post.replies.map(
        ({ message }: { message: string }) => message
      );

      content.push(post.title, post.message);

      return content.some((str: string) =>
        str.toLowerCase().includes(q.toLowerCase())
      );
    });
  }

  return json({ discussions, sort });
}

export default function Index() {
  const { discussions, sort } = useLoaderData<typeof loader>();

  return <PostsList posts={discussions} sort={sort} />;
}
