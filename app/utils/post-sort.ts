import { type CollectionRecordResponse } from "@polybase/client";
import { type Post } from "~/types";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

interface Reply {
  timestamp: string;
}

/**
 * Filter all posts by only discussions and group each discussion's replies
 * @param posts Polybase Post collection[]
 */
export function getDiscussionsFromPosts(
  posts: CollectionRecordResponse<any>[]
) {
  // Filter all posts by discussions
  let discussions = posts
    .filter(({ data }) => !data.discussion)
    .map(({ data }) => data);

  // Group each discussion's replies
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

  //  Sort each discussion's replies newest to oldest
  for (let discussion of discussions) {
    if (discussion.replies) {
      discussion.replies.sort((a: Reply, b: Reply) =>
        dayjs(a.timestamp).isAfter(dayjs(b.timestamp)) ? 1 : -1
      );
    }
  }

  return discussions;
}

/**
 *
 * @param discussions Discussions with optional replies (posts) array
 * @param sort Sort parameter
 */
export function sortDiscussions(discussions: Post[], sort: string) {
  // Sort by total number of replies
  if (sort === "top") {
    discussions.sort((a, b) => {
      if (a.replies && b.replies) {
        return b.replies.length - a.replies.length;
      }

      return 0;
    });
    // Sort by most recent replies
  } else if (sort === "recent") {
    discussions.sort((a, b) => {
      if (a.replies && b.replies) {
        const bTimestamp = b.replies[b.replies.length - 1];

        const aTimestamp = a.replies[a.replies.length - 1];

        return dayjs(bTimestamp.timestamp).isAfter(dayjs(aTimestamp.timestamp))
          ? 1
          : -1;
      }

      return 0;
    });
  }

  return discussions;
}
