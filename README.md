<p align="center">
  <img src="assets/logo.svg" alt="DataCanvas" width="360" />
</p>

<p align="center">
  <strong>Delphi-style data components for modern TypeScript web apps.</strong>
</p>

<p align="center">
  <a href="https://github.com/isalo/data-canvas/actions/workflows/ci.yml"><img src="https://github.com/isalo/data-canvas/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/status-v0.1%20MVP-orange.svg" alt="Status" />
</p>

---

DataCanvas is a full-stack data framework: **define entities once** and
automatically get CRUD APIs, React screens, data grids, forms, lookups,
validation, and PostgreSQL persistence.

```ts
export const Country = entity("countries", {
  id: field.uuid().primary(),
  name: field.text().required(),
});

export const Customer = entity("customers", {
  id: field.uuid().primary(),
  name: field.text().required(),
  email: field.email(),
  countryId: field.lookup(Country, { label: "name" }),
});
```

```tsx
export default function CustomersPage() {
  return <EntityScreen entity={Customer} />;
}
```

That's a complete CRUD screen: sortable paginated grid, free-text search,
create/edit modal forms, lookup selects, Zod validation (client _and_ server),
and delete confirmation — all generated from metadata at runtime. No codegen.

## Why this exists

Desktop frameworks like Delphi, .NET data components, Data Abstract and
DevExpress XAF solved "table → screen" decades ago: you described your data
once and got grids, forms and persistence for free. Modern web stacks have
excellent primitives — Prisma/Drizzle, TanStack Table/Query, Next.js — but you
still hand-wire the same CRUD plumbing for every entity.

DataCanvas brings the data-component model to TypeScript, built on those
modern primitives, with three rules:

1. **Metadata-first** — one entity definition drives everything.
2. **No magic that cannot be overridden** — every layer has an escape hatch.
3. **No vendor lock-in** — headless core, documented adapter contract, plain
   HTTP API.

## Architecture

```txt
        ┌─────────────────────────────────────────────────┐
        │              @data-canvas/core                   │
        │  entity() · field builders · Zod validation     │
        │  metadata + DataAdapter contract (no runtime    │
        │  dependencies besides zod)                      │
        └──────────────┬──────────────────┬───────────────┘
                       │                  │
        ┌──────────────▼─────┐   ┌────────▼───────────────┐
        │ @data-canvas/server │   │  @data-canvas/react     │
        │ createDataCanvas() │   │  DataCanvasProvider    │
        │ CRUD Request →     │   │  EntityScreen / Grid / │
        │ Response handlers  │   │  Form / Lookup + hooks │
        │ + memory adapter   │   │  (TanStack Table+Query)│
        └──────────────┬─────┘   └────────┬───────────────┘
                       │                  │ HTTP (JSON)
        ┌──────────────▼─────────┐        │
        │ @data-canvas/adapter-   │◄───────┘
        │ drizzle                │
        │ entity → pgTable,      │
        │ Drizzle ORM queries    │
        └──────────────┬─────────┘
                       │
                 PostgreSQL
```

## Packages

| Package                        | Description                                                        |
| ------------------------------ | ------------------------------------------------------------------ |
| `@data-canvas/core`            | Entity metadata, field builders, relations, Zod validation         |
| `@data-canvas/server`          | CRUD API generation, request handling, in-memory adapter           |
| `@data-canvas/react`           | `EntityScreen`, `EntityGrid`, `EntityForm`, `EntityLookup`, hooks  |
| `@data-canvas/adapter-drizzle` | Drizzle ORM / PostgreSQL adapter                                   |
| `apps/demo`                    | Next.js demo app (Countries, Customers, Orders with master/detail) |
| `apps/docs`                    | Documentation website                                              |

## Quick start

### Use it in a Next.js app

**1. Define entities** (shared between server and client):

```ts
import { entity, field } from "@data-canvas/core";

export const Country = entity("countries", {
  id: field.uuid().primary(),
  name: field.text().required(),
});
```

**2. Create the server app:**

```ts
import { createDataCanvas } from "@data-canvas/server";
import { drizzleAdapter } from "@data-canvas/adapter-drizzle";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const db = drizzle(postgres(process.env.DATABASE_URL!));

export const app = createDataCanvas({
  entities: [Country, Customer, Order, OrderItem],
  adapter: drizzleAdapter(db),
});
```

**3. Mount the API** in `app/api/datacanvas/[[...path]]/route.ts`:

```ts
export const GET = app.handlers.GET;
export const POST = app.handlers.POST;
export const PATCH = app.handlers.PATCH;
export const DELETE = app.handlers.DELETE;
```

**4. Render screens:**

```tsx
import { DataCanvasProvider, EntityScreen } from "@data-canvas/react";
import "@data-canvas/react/styles.css";

<DataCanvasProvider baseUrl="/api/datacanvas">
  <EntityScreen entity={Customer} />
</DataCanvasProvider>;
```

Need custom UI? Drop a layer down: `useEntityList`, `useEntityMutations` and
`useLookupOptions` are headless hooks, and `EntityGrid` / `EntityForm` /
`EntityLookup` are controlled components you can compose yourself.

## Local development

```bash
git clone https://github.com/isalo/data-canvas.git
cd data-canvas
pnpm install
pnpm build      # build all packages
pnpm dev        # demo on :3000, docs on :3001
```

The demo works immediately with a seeded **in-memory adapter** — no database
required.

### PostgreSQL via Docker

```bash
pnpm db:up                            # postgres:16 with schema + seed data
cp .env.example apps/demo/.env.local  # sets DATABASE_URL
pnpm dev
```

`docker/init.sql` creates and seeds the demo tables on first start. Stop the
database with `pnpm db:down`.

## Testing

```bash
pnpm test       # Vitest unit tests (core + server)
pnpm e2e        # Playwright end-to-end tests against the demo app
pnpm lint       # ESLint
pnpm typecheck  # tsc --noEmit everywhere
```

## Deployment

Both apps are standard Next.js App Router projects and deploy to Vercel
out of the box:

- **Demo** — import the repo in Vercel, set the _Root Directory_ to
  `apps/demo`. Set `DATABASE_URL` to a hosted PostgreSQL (Neon, Supabase,
  Vercel Postgres) and run `docker/init.sql` against it once; without the
  variable the demo runs on the in-memory adapter (non-persistent, fine for
  showcasing).
- **Docs** — same, with _Root Directory_ `apps/docs`.

Vercel detects pnpm workspaces and Turborepo automatically.

## Roadmap

```txt
v0.1 — Entity metadata, CRUD API, React EntityScreen, lookup fields   ← we are here
v0.2 — Master/detail screens, batch updates
v0.3 — Permissions, audit log
v0.4 — Import/export CSV
v0.5 — Custom actions
v0.6 — Visual screen designer
v1.0 — DataCanvas Studio
```

## Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, workflow and
design principles, and use [Changesets](https://github.com/changesets/changesets)
for anything that touches a published package.

## License

[MIT](LICENSE) © isalo
