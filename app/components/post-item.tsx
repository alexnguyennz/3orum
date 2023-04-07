import { useState, useEffect } from 'react';

import { Link, useRevalidator } from '@remix-run/react';

import { useAccount } from 'wagmi';

import { polybase } from '~/root';

import { Group, Menu, UnstyledButton, Stack, Text } from '@mantine/core';
import {
  IconArrowBackUp,
  IconDotsVertical,
  IconMessageCircle2,
  IconTrash,
} from '@tabler/icons-react';

import type { Post } from '~/types';

import truncateAddress from '~/utils/truncateAddress';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function PostItem({ post }: { post: Post }) {
  const revalidator = useRevalidator();

  const { address } = useAccount();

  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    setShowControls(address?.toLowerCase() === post.account);
  }, [address]);

  async function deletePost() {
    const collection = polybase.collection('Post');
    await collection
      .record(post.id)
      .call('del')
      .catch((err) => {
        console.log(err);
      });

    revalidator.revalidate();
  }

  return (
    <li className="post-item w-full rounded-xl bg-white p-3 px-5 shadow transition hover:bg-yellow-50">
      <Group position="apart" align="center">
        <Stack spacing={0} className="grow">
          <Link to={`/d/${post.id}`}>
            <Stack spacing={2}>
              <Text size="lg" weight={600} color="gray.7" lineClamp={1}>
                {post.title}
              </Text>
            </Stack>
            <Text size="sm" color="gray.6">
              <span>
                {post.replies ? (
                  <Group align="center" spacing={3}>
                    <IconArrowBackUp className="h-4 w-4" />
                    <span>
                      {truncateAddress(post.replies[0].account)} replied{' '}
                      {dayjs(post.replies[0].timestamp).fromNow()}
                    </span>
                  </Group>
                ) : (
                  <span>
                    {truncateAddress(post.account)} started{' '}
                    {dayjs(post.timestamp).fromNow()}
                  </span>
                )}
              </span>
            </Text>
          </Link>
        </Stack>
        <Group spacing="sm" align="center">
          <Group spacing={4} align="center" className="text-sm">
            <IconMessageCircle2 className="h-4 w-4" />
            <Text>{post.replies ? post.replies.length : 0}</Text>
          </Group>

          {showControls && (
            <div className="control-menu mt-1">
              <Menu shadow="md" width={200} withArrow>
                <Menu.Target>
                  <UnstyledButton>
                    <IconDotsVertical className="h-5 w-5" />
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    onClick={deletePost}
                    icon={<IconTrash className="h-5 w-5" />}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          )}
        </Group>
      </Group>
    </li>
  );
}
