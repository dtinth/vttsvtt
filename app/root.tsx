import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

export function Layout({ children }: { children: React.ReactNode }) {
  if (typeof window === "undefined") {
    return (
      <html lang="en" data-bs-theme="dark" className="dtinth">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>VTT ↔ TSV</title>
          <Meta />
          <Links />
        </head>
        <body>
          <div id="app">{children}</div>
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    );
  } else {
    return <>{children}</>;
  }
}

export default function App() {
  return <Outlet />;
}

export function HydrateFallback() {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading...</p>
      </div>
    </div>
  );
}
