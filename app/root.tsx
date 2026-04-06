import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap",
  },
];

export function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>WasteYourMoney — Burn Real Money For No Reason</title>
        <meta
          name="description"
          content="The internet's most honest transaction. Pay real money. Get absolutely nothing. Watch it burn on the leaderboard."
        />
        <Meta />
        <Links />
      </head>
      <body className="noise-bg">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="font-[family-name:var(--font-display)] text-7xl font-bold fire-glow-intense mb-4">
        {message}
      </h1>
      <p className="text-text-muted text-lg mb-2">{details}</p>
      <p className="text-text-dim text-sm">At least this error was free.</p>
      {stack && (
        <pre className="w-full max-w-2xl mt-8 p-4 overflow-x-auto bg-surface rounded-xl border border-border text-sm text-text-dim">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
