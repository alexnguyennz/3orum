import { NavLink, useLoaderData, Outlet } from '@remix-run/react';
import { json, type LoaderArgs } from '@remix-run/node';

import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

import { polybase } from '~/root';

/* Components */
import { Group, Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMessages } from '@tabler/icons-react';

import DiscussionEditor from '~/components/discussion-editor';
import TagIcon from '~/components/tag-icon';

export async function loader(args: LoaderArgs) {
  const { data: tags } = await polybase.collection('Tag').get();

  return json({ tags });
}

// layout for index and /t/*
export default function HomeLayout() {
  const { tags } = useLoaderData<typeof loader>();

  const [opened, { open, close }] = useDisclosure(false);

  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();

  return (
    <main className="mx-auto my-10 max-w-6xl">
      <Modal
        opened={opened}
        onClose={close}
        title={<></>}
        classNames={{ inner: 'top-auto' }} /* place modal at bottom of screen */
        yOffset={0}
        overlayProps={{ opacity: 0, blur: 0 }}
        size="auto"
        transitionProps={{ transition: 'slide-up' }}
      >
        <DiscussionEditor address={address} tagsData={tags} />
      </Modal>

      <div className="flex flex-col gap-10 md:flex-row">
        <div className="space-y-5">
          <Button
            onClick={isConnected ? open : openConnectModal}
            fullWidth
            color="dark.4"
            radius="md"
          >
            Start a Discussion
          </Button>
          <ul className="mt-0 list-none space-y-3 pl-0 text-sm">
            <li>
              <NavLink to="/">
                <Group>
                  <IconMessages className="h-5 w-5" />
                  All discussions
                </Group>
              </NavLink>
            </li>

            {tags.map(({ data: tag }) => (
              <li key={tag.id}>
                <NavLink to={`/t/${tag.id}`}>
                  <Group>
                    <TagIcon name={tag.icon} />
                    {tag.name}
                  </Group>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
