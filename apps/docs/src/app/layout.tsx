import "./globals.css";

import { type Metadata } from "next";
import Link from "next/link";
import { type ReactNode } from "react";

export const metadata: Metadata = {
  title: "DataCanvas — Delphi-style data components for TypeScript",
  description:
    "Define entities once and automatically get CRUD APIs, React screens, tables, forms, lookups, validation, and PostgreSQL persistence.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="site-logo">
            <span className="site-logo-mark" />
            DataCanvas
          </Link>
          <nav>
            <Link href="/docs/getting-started">Docs</Link>
            <a href="https://github.com/isalo/datacanvas">GitHub</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
