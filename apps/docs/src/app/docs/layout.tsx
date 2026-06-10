import Link from "next/link";
import { type ReactNode } from "react";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="docs-shell">
      <aside className="docs-sidebar">
        <span className="section">Introduction</span>
        <Link href="/docs/getting-started">Getting started</Link>
        <span className="section">Guides</span>
        <Link href="/docs/entities">Entities &amp; fields</Link>
        <Link href="/docs/server">Server &amp; API</Link>
        <Link href="/docs/react">React components</Link>
        <Link href="/docs/adapters">Database adapters</Link>
        <span className="section">Project</span>
        <Link href="/docs/screenshots">Screenshots</Link>
        <Link href="/docs/roadmap">Roadmap</Link>
      </aside>
      <article className="docs-content">{children}</article>
    </div>
  );
}
