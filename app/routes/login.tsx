import type { ActionArgs, LoaderArgs } from '@remix-run/node'; // or cloudflare/deno
import { json, redirect } from '@remix-run/node'; // or cloudflare/deno
import { useLoaderData } from '@remix-run/react';

import { getSession, commitSession } from '~/session.server';
import { authenticator } from '~/auth.server';

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  const data = { error: session.get('error') };

  // return await authenticator.isAuthenticated(request, {
  //   successRedirect: '/dashboard',
  // });

  return json(data, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

export async function action({ request }: ActionArgs) {
  const body = await request.json();

  delete body.avatar;

  const session = await getSession(request.headers.get('Cookie'));

  session.set('user', body);

  return redirect('/', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}
