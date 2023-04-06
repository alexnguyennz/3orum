import { useEffect, useState } from 'react';
import { Link } from '@remix-run/react';

import { useAccount } from 'wagmi';
import ConnectButton from '~/components/connect-button';

import { polybase } from '~/root';
import { callCreateUser } from '~/utils/polybase';

export default function Header() {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      queryUser(address);
    }
  }, [address, isConnected]);

  /**
   * check if logged in user has a record, if not then create it
   */
  async function queryUser(address: string) {
    try {
      const { data } = await polybase.collection('User').record(address).get();

      // set cookie
      await fetch('login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err) {
      await callCreateUser(address);
    }
  }

  return (
    <header>
      <div className="mx-5">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <h1 className="text-xl">
            <Link to="/" className="font-bold text-slate-200 hover:underline">
              3orum
            </Link>
          </h1>
          <nav className="flex gap-3">
            {/* <TextInput placeholder="Search forum" icon={<IconSearch />} /> */}

            <ConnectButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
