import { json, redirect, type LoaderArgs } from '@remix-run/node';

import { getSession, commitSession } from '~/sessions';

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  session.unset('user');

  return redirect('/', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}
