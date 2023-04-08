import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "@remix-run/react";

import { useAccount } from "wagmi";
import ConnectButton from "~/components/connect-button";

import { polybase } from "~/root";
import { callCreateUser } from "~/utils/polybase";

import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

export default function Header() {
  const { address, isConnected } = useAccount();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const q = searchParams.get("q");

  const [searchValue, setSearchValue] = useState<string>(q || "");

  useEffect(() => {
    if (isConnected && address) {
      queryUser(address);
    }
  }, [address, isConnected]);

  /**
   * check if logged-in user has a record, if not then create it
   */
  async function queryUser(address: string) {
    try {
      const { data } = await polybase.collection("User").record(address).get();

      // set cookie
      await fetch("/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (err) {
      await callCreateUser(address);
    }
  }

  return (
    <header>
      <div className="mx-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl">
            <Link to="/" className="font-bold text-slate-200 hover:underline">
              3orum
            </Link>
          </h1>
          <nav className="flex gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate(`/?q=${searchValue}`);
              }}
            >
              <TextInput
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search discussions"
                icon={<IconSearch className="h-4 w-4" strokeWidth={"3"} />}
                radius="md"
              />
            </form>

            <ConnectButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
