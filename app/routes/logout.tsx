import type { ActionArgs, LoaderArgs } from '@remix-run/node'; // or cloudflare/deno
import { json, redirect } from '@remix-run/node'; // or cloudflare/deno
import { useLoaderData } from '@remix-run/react';

import { getSession, commitSession } from '~/session.server';
import { authenticator } from '~/auth.server';

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  console.log('clearing session', session.get('user'));
  session.unset('user');
  console.log('session after unset', session.get('user'));

  return json({
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}
