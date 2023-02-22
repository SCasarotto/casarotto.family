import type { LinksFunction, MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
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

export default function App() {
  return (
    <html lang='en'>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
