import {
  useEffect,
  useState,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Link, useLocation } from "@remix-run/react";

import { useAccount } from "wagmi";

import { EditorContext } from "~/provider/EditorProvider";

import { ActionIcon, Avatar, Menu, Text } from "@mantine/core";
import { IconDots, IconPencil, IconTrash } from "@tabler/icons-react";

import type { Post as PostType, Users } from "~/types";

// Utilities
import parse from "html-react-parser";
import truncateAddress from "~/utils/truncateAddress";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function Post({
  post,
  open,
  setSelectedPost,
  deletePost,
  users,
}: {
  post: PostType;
  open: () => void;
  setSelectedPost: Dispatch<SetStateAction<string>>;
  deletePost: (id: string) => Promise<void>;
  users?: Users[];
}) {
  const { pathname } = useLocation();

  const { address } = useAccount();

  const { setTitle, setContent } = useContext(EditorContext);
  const [showControls, setShowControls] = useState(false);

  function getAvatar() {
    if (users) {
      const find = users.find(
        (element: Users) => element.data.id === post.account
      );

      return find!.data.avatar;
    }
  }

  useEffect(() => {
    setShowControls(address?.toLowerCase() === post.account);
  }, [address]);

  return (
    <div className="post post-item flex grow flex-col gap-5 px-3 text-sm">
      <div className="flex gap-5">
        <Link to={`/u/${post.account}`}>
          <Avatar
            src={getAvatar()}
            className="rounded-full"
            alt="avatar"
            size="xl"
          />
        </Link>
        <div className="w-full space-y-3">
          <div className="flex grow gap-3 text-sm">
            <Text weight="bold">
              <Link to={`/u/${post.account}`} className="hover:underline">
                {truncateAddress(post.account)}
              </Link>
            </Text>
            <span className="text-gray-400">
              {dayjs(post.timestamp).fromNow()}
            </span>
          </div>

          {pathname.startsWith("/d/") ? (
            <div className="post-body rounded-xl bg-white p-5 shadow">
              {parse(post.message)}
            </div>
          ) : (
            <div>
              <Link to={`/d/${post.discussion?.id || post.id}`}>
                <div className="post-body rounded-xl bg-white p-5 shadow">
                  {parse(post.message)}
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {showControls ? (
        <div className="control-menu controls flex justify-end transition">
          <Menu shadow="md" width={200} withArrow>
            <Menu.Target>
              <ActionIcon color="dark" variant="transparent">
                <IconDots className="h-5 w-5" />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                onClick={() => {
                  setTitle(post.title);
                  setContent(post.message);
                  if (setSelectedPost) setSelectedPost(post.id);
                  open();
                }}
                icon={<IconPencil className="h-5 w-5" />}
              >
                Edit
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                onClick={() => deletePost(post.id)}
                icon={<IconTrash className="h-5 w-5" />}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      ) : (
        <div className="invisible">
          <Menu>
            <Menu.Target>
              <ActionIcon>
                <IconDots className="h-5 w-5" />
              </ActionIcon>
            </Menu.Target>
          </Menu>
        </div>
      )}
    </div>
  );
}
