import { Link } from "@remix-run/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";

import { Menu, Button } from "@mantine/core";
import {
  IconChevronDown,
  IconLogout,
  IconSettings,
  IconUser,
  IconWallet,
} from "@tabler/icons-react";

export default function Connect() {
  const { disconnect } = useDisconnect();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        if (!mounted) {
          return (
            <Button
              variant="white"
              color="dark"
              radius="md"
              loading={true}
              styles={{
                leftIcon: {
                  margin: 0,
                },
              }}
              aria-label="Loading placeholder button"
            />
          );
        }

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    rightIcon={<IconWallet />}
                    variant="white"
                    color="dark"
                    radius="md"
                    styles={{
                      root: {
                        paddingLeft: 10,
                        paddingRight: 5,
                      },
                      rightIcon: {
                        margin: 3,
                      },
                    }}
                  >
                    Login
                  </Button>
                );
              }

              return (
                <Menu shadow="md" width={200} withArrow>
                  <Menu.Target>
                    <Button
                      rightIcon={<IconChevronDown />}
                      variant="white"
                      color="dark"
                      radius="md"
                      styles={{
                        root: {
                          paddingLeft: 10,
                          paddingRight: 5,
                        },
                        rightIcon: {
                          margin: 3,
                        },
                      }}
                    >
                      {account.displayName}
                    </Button>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      component={Link}
                      to={`/u/${account.address}`}
                      icon={<IconUser className="h-5 w-5" />}
                    >
                      Profile
                    </Menu.Item>
                    <Menu.Item
                      component={Link}
                      to={`/settings`}
                      icon={<IconSettings className="h-5 w-5" />}
                    >
                      Settings
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      onClick={async () => {
                        disconnect();
                      }}
                      component={Link}
                      reloadDocument
                      to={`/logout`}
                      icon={<IconLogout className="h-5 w-5" />}
                      color="red"
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
