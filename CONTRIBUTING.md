# Contributing to DataCanvas

Thanks for your interest in contributing! This document covers everything you
need to get a local environment running and land a change.

## Prerequisites

- Node.js >= 20
- pnpm >= 9 (`corepack enable` is the easiest way)
- Docker (optional, for PostgreSQL)

## Getting started

```bash
git clone https://github.com/isalo/data-canvas.git
cd data-canvas
pnpm install
pnpm build        # builds all packages (the apps consume built output)
pnpm dev          # starts demo (:3000) and docs (:3001) in watch mode
```

To run the demo against PostgreSQL instead of the in-memory fallback:

```bash
cp .env.example apps/demo/.env.local
pnpm db:up        # starts PostgreSQL with schema + seed data
```

## Repository layout

| Path                        | Contents                                                  |
| --------------------------- | --------------------------------------------------------- |
| `packages/core`             | Entity metadata, field builders, Zod validation           |
| `packages/server`           | CRUD API generation, request handling, memory adapter     |
| `packages/react`            | EntityScreen, EntityGrid, EntityForm, EntityLookup, hooks |
| `packages/adapters/drizzle` | Drizzle ORM / PostgreSQL adapter                          |
| `apps/demo`                 | Next.js demo application                                  |
| `apps/docs`                 | Documentation website                                     |

## Development workflow

```bash
pnpm lint          # ESLint across the repo
pnpm format        # Prettier write
pnpm typecheck     # tsc --noEmit in every package
pnpm test          # Vitest unit tests
pnpm e2e           # Playwright end-to-end tests (demo app)
```

Please make sure `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`
pass before opening a pull request — CI runs the same commands.

## Changesets

We use [Changesets](https://github.com/changesets/changesets) for versioning.
If your change affects a published package (`@data-canvas/*`), run:

```bash
pnpm changeset
```

and follow the prompts. Choose `patch` for fixes, `minor` for new features.
Pure docs/demo changes don't need a changeset.

## Design principles

When proposing changes, keep these in mind:

- **Metadata-first** — entity metadata is the single source of truth.
- **No magic that cannot be overridden** — every default needs an escape hatch.
- **Headless core** — UI lives in `@data-canvas/react`; everything below it must work without React.
- **Minimal dependencies** — adding a dependency to a published package needs a good reason.
- **Simple over clever** — this codebase should be easy to read end to end.

## Reporting bugs

Use the issue templates. A minimal reproduction (entity definition + the call
that misbehaves) speeds things up enormously.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Be kind.
