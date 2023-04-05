import { useEffect, useState } from 'react';
import { NavLink, useLoaderData, useRevalidator } from '@remix-run/react';
import { json, redirect, type LoaderArgs } from '@remix-run/node';
import { getSession } from '~/session.server';

import { useAccount } from 'wagmi';

import { polybase } from '~/root';

/* UI */
import { Avatar, Button, Group, Stack, TextInput } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import {
  IconMessageCircle2,
  IconMenu2,
  IconSettings,
} from '@tabler/icons-react';

/* Utilities */
import { callSetAvatar } from '~/utils/polybase';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

type Profile = {
  id: string;
  username: string;
  avatar: string;
  created_at: string;
};

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  const userSession = session.get('user');
  console.log('/settings userSession', userSession);

  if (!userSession) return redirect('/');

  const { data: user } = await polybase
    .collection('User')
    .record(userSession.id.toLowerCase())
    .get();

  const { data: posts } = await polybase
    .collection('Post')
    .where('account', '==', userSession.id.toLowerCase())
    .sort('timestamp', 'desc')
    .get();

  // query workaround - filter out all posts for only discussions
  const discussions = posts.filter((post) => !post.data.discussion);

  return json({ user, posts, discussions });
}

export default function Settings() {
  const { user, posts, discussions } = useLoaderData<typeof loader>();

  const [username, setUsername] = useState(user?.username);
  const [loading, setLoading] = useState(false);

  async function updateUsername() {
    setLoading(true);

    await polybase
      .collection('User')
      .record(user.id.toLowerCase())
      .call('setUsername', [username])
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });

    setLoading(false);
    revalidator.revalidate();
  }

  const revalidator = useRevalidator();

  return (
    <>
      <div className="my-6 space-y-10">
        <div className="mx-auto h-48 max-w-6xl rounded-xl bg-white px-6 shadow-lg">
          <div className="flex w-40 max-w-6xl items-center gap-10 py-10">
            <Dropzone
              onDrop={async (files) => {
                callSetAvatar(user.id.toLowerCase(), files[0], revalidator);
              }}
              maxSize={3 * 1024 ** 2}
              accept={IMAGE_MIME_TYPE}
              className="rounded-full"
            >
              <Dropzone.Idle>
                <Avatar
                  src={user?.avatar}
                  className="rounded-full"
                  alt="User's avatar"
                  size="xl"
                />
              </Dropzone.Idle>
            </Dropzone>
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
              <NavLink to={`/u/${user.id.toLowerCase()}`} end>
                <Group>
                  <IconMessageCircle2 className="h-5 w-5" />
                  Posts{' '}
                  <span className="ml-1 text-xs">
                    {!!posts.length && posts.length}
                  </span>
                </Group>
              </NavLink>
            </li>
            <li>
              <NavLink to={`/u/${user.id.toLowerCase()}/discussions`} end>
                <Group>
                  <IconMenu2 className="h-5 w-5" />
                  Discussions
                  <span className="ml-1 text-xs">
                    {!!discussions.length && discussions.length}
                  </span>
                </Group>
              </NavLink>
            </li>

            {/* {auth && id === auth.account && ( */}
            <li>
              <NavLink to="/settings" end>
                <Group>
                  <IconSettings className="h-5 w-5" />
                  Settings
                </Group>
              </NavLink>
            </li>
          </ul>

          <div className="grow space-y-5">
            <Stack align="flex-start">
              <TextInput
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                label="Username"
                description="Your profile name"
                inputWrapperOrder={['label', 'error', 'input', 'description']}
              />

              <Button onClick={updateUsername} loading={loading} color="dark.4">
                Update
              </Button>
            </Stack>
          </div>
        </div>
      </main>
    </>
  );
}
