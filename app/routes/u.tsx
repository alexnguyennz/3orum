import { useEffect, useState } from "react";
import {
  NavLink,
  Outlet,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";
import { json, type LoaderArgs } from "@remix-run/node";

import { useAccount } from "wagmi";
import { polybase } from "~/root";

/* UI */
import { Avatar, Group, Stack } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import {
  IconMessageCircle2,
  IconMenu2,
  IconSettings,
} from "@tabler/icons-react";

/* Utilities */
import { getDiscussionsFromPosts } from "~/utils/post-sort";
import { callSetAvatar } from "~/utils/polybase";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export async function loader({ params }: LoaderArgs) {
  const { id } = params;

  const userId = id; // for any checksummed addresses

  const { data: user } = await polybase
    .collection("User")
    .record(userId!)
    .get();

  const { data: posts } = await polybase
    .collection("Post")
    .where("account", "==", userId!)
    .sort("timestamp", "desc")
    .get();

  let discussions = getDiscussionsFromPosts(posts);

  // workaround - get all users to display avatar beside each post
  const { data: users } = await polybase.collection("User").get();

  return json({
    id,
    user,
    posts,
    discussions,
    users,
  });
}

export default function UserLayout() {
  const { id, user, posts, discussions } = useLoaderData<typeof loader>();

  const { address } = useAccount();
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    setShowControls(address === id!);
  }, [address]);

  const revalidator = useRevalidator();

  return (
    <>
      <div className="my-6 space-y-10">
        <div className="mx-auto h-48 max-w-6xl rounded-xl bg-white px-6 shadow-lg">
          <div className="flex w-40 max-w-6xl items-center gap-10 py-10">
            {showControls ? (
              <Dropzone
                onDrop={(files) => callSetAvatar(id!, files[0], revalidator)}
                maxSize={3 * 1024 ** 2}
                accept={IMAGE_MIME_TYPE}
                className="rounded-full"
              >
                <Dropzone.Idle>
                  <Avatar
                    src={user.avatar ? user.avatar : "/avatar.png"}
                    className="rounded-full"
                    alt="User's avatar"
                    size="xl"
                  />
                </Dropzone.Idle>
              </Dropzone>
            ) : (
              <div className="avatar-border">
                <Avatar
                  src={user.avatar ? user.avatar : "/avatar.png"}
                  className="rounded-full"
                  alt="User's avatar"
                  size="xl"
                />
              </div>
            )}

            <Stack>
              <span className="text-lg">{user.id}</span>
              <span className="text-lg">{user.username}</span>
              <span className="text-sm">
                Joined {dayjs(user.created_at).fromNow()}
              </span>
            </Stack>
          </div>
        </div>
      </div>

      <main className="mx-auto my-10 max-w-6xl">
        <div className="flex flex-col gap-10 md:flex-row">
          <ul className="mt-0 list-none space-y-3 pl-0 text-sm">
            <li>
              <NavLink to={`/u/${id}`} end>
                <Group>
                  <IconMessageCircle2 className="h-5 w-5" />
                  Posts
                  <span className="ml-1 text-xs">{posts.length}</span>
                </Group>
              </NavLink>
            </li>
            <li>
              <NavLink to={`/u/${id}/discussions`} end>
                <Group>
                  <IconMenu2 className="h-5 w-5" />
                  Discussions
                  <span className="ml-1 text-xs">{discussions.length}</span>
                </Group>
              </NavLink>
            </li>

            {showControls && (
              <li>
                <NavLink to="/settings" end>
                  <Group>
                    <IconSettings className="h-5 w-5" />
                    Settings
                  </Group>
                </NavLink>
              </li>
            )}
          </ul>

          <div className="grow space-y-5">
            <Outlet />
          </div>
        </div>
      </main>
    </>
  );
}
