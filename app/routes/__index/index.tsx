import { useLoaderData } from "@remix-run/react";
import { json, type LoaderArgs } from "@remix-run/node";

import { polybase } from "~/root";

import PostsList from "~/components/posts-list";

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

  // Polybase workaround - filter out all posts for only discussions
  let discussions = posts
    .filter(({ data }) => !data.discussion)
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

  return json({ discussions });
}

export default function Index() {
  const { discussions } = useLoaderData<typeof loader>();

  return <PostsList posts={discussions} />;
}
