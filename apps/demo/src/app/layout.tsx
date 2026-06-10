import "@datacanvas/react/styles.css";
import "./globals.css";

import { type Metadata } from "next";
import Link from "next/link";
import { type ReactNode } from "react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "DataCanvas Demo",
  description: "Delphi-style data components for modern TypeScript web apps.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="app-shell">
            <aside className="app-sidebar">
              <Link href="/" className="app-logo">
                <span className="app-logo-mark" />
                DataCanvas
              </Link>
              <Link href="/customers" className="app-nav-link">
                Customers
              </Link>
              <Link href="/countries" className="app-nav-link">
                Countries
              </Link>
              <Link href="/orders" className="app-nav-link">
                Orders
              </Link>
            </aside>
            <main className="app-main">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
