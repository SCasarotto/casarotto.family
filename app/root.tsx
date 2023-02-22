import type {
  LinksFunction,
  MetaFunction,
  SerializeFrom,
} from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import { Analytics } from '@vercel/analytics/react';
import datepicker from 'react-datepicker/dist/react-datepicker.css';

import styles from '~/tailwind.css';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

import datepickerOverrides from './styles/react-datepicker-overrides.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: datepicker },
  { rel: 'stylesheet', href: datepickerOverrides },
  { rel: 'stylesheet', href: styles },
];

export const loader = () => ({
  ENV: {
    VERCEL_ANALYTICS_ID: process.env.VERCEL_ANALYTICS_ID,
  },
});

// Attach the ENV to the window object so that Remix can access it
declare global {
  interface Window {
    ENV: SerializeFrom<typeof loader>['ENV'];
  }
}

export default function App() {
  const { ENV } = useLoaderData<typeof loader>();

  return (
    <html lang='en'>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Analytics />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        {/* 👇 Write the ENV values to the window */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
      </body>
    </html>
  );
}
