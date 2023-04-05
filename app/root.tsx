import type { LinksFunction, MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';

import stylesheet from '~/styles/main.css';

import EditorProvider from './provider/EditorProvider';

/* Polybase */
import { PolybaseProvider, AuthProvider } from '@polybase/react';
import { Polybase } from '@polybase/client';
import { Auth } from '@polybase/auth';

/* Components */
import Header from './components/header';

/* Mantine */
import { MantineProvider, createEmotionCache } from '@mantine/core';
import { StylesPlaceholder } from '@mantine/remix';

/* RainbowKit */
import rainbowKitStylesheet from '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { signMessage } from '@wagmi/core';

/* Wagmi */
const { chains, provider } = configureChains(
  [mainnet, polygon],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: '3orum',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

createEmotionCache({ key: 'mantine' });

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: stylesheet },
    { rel: 'stylesheet', href: rainbowKitStylesheet },
  ];
};

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: '3orum',
  viewport: 'width=device-width,initial-scale=1',
});

export const polybase = new Polybase({
  defaultNamespace:
    'pk/0xd9fbdbe5b28ed9292e7f34d1dce95f657504c533cefff18efe7e250d48ef10a9950f4fa68b2376db3425aff93911bf0df33d8d23b52d44a6838fc7ef922cb2e1/3orum',
  //'pk/0xd9fbdbe5b28ed9292e7f34d1dce95f657504c533cefff18efe7e250d48ef10a9950f4fa68b2376db3425aff93911bf0df33d8d23b52d44a6838fc7ef922cb2e1/3orum',
  // use wagmi signer for Polybase client
  signer: async (data: string) => {
    return {
      h: 'eth-personal-sign',
      sig: await signMessage({ message: data }),
    };
  },
});

const auth = typeof window !== 'undefined' ? new Auth() : null;

export default function App() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <EditorProvider>
        <PolybaseProvider polybase={polybase}>
          {/* <AuthProvider polybase={polybase} auth={auth}> */}
          <html lang="en">
            <head>
              <Meta />
              <Links />

              <StylesPlaceholder />
              <link rel="icon" href="/favicon.png" />
            </head>
            <body>
              {wagmiClient && chains ? (
                <WagmiConfig client={wagmiClient}>
                  <RainbowKitProvider
                    chains={chains as Chain[]}
                    modalSize="compact"
                  >
                    <Header />
                    <div className="mx-5">
                      <Outlet />
                    </div>
                  </RainbowKitProvider>
                </WagmiConfig>
              ) : null}
              <ScrollRestoration />
              <Scripts />
              <LiveReload />
            </body>
          </html>
          {/* </AuthProvider> */}
        </PolybaseProvider>
      </EditorProvider>
    </MantineProvider>
  );
}
