import { json, type ActionArgs } from '@remix-run/node';

import { getSession, commitSession } from '~/sessions';

export async function action({ request }: ActionArgs) {
  const body = await request.json();

  delete body.avatar;

  const session = await getSession(request.headers.get('Cookie'));

  session.set('user', body);

  return json(
    {},
    {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    }
  );
}
