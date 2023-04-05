import { RemixBrowser } from '@remix-run/react';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';

import { ClientProvider } from '@mantine/remix';

import { Buffer } from 'buffer-polyfill';

window.process = window.process ?? { env: {} }; // process.env polyfill
globalThis.Buffer = Buffer as unknown as BufferConstructor;

function hydrate() {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <ClientProvider>
          <RemixBrowser />
        </ClientProvider>
      </StrictMode>
    );
  });
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1);
}
