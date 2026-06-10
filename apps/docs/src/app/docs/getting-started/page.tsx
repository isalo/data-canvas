import { CodeBlock } from "@/components/CodeBlock";

export default function GettingStartedPage() {
  return (
    <>
      <h1>Getting started</h1>
      <p>
        DataCanvas is a metadata-first data framework. You define entities once, and the same
        definition drives the generated CRUD API, Zod validation, database access and the React UI.
      </p>

      <h2>1. Define entities</h2>
      <CodeBlock>{`import { entity, field } from "@datacanvas/core";

export const Country = entity("countries", {
  id: field.uuid().primary(),
  name: field.text().required(),
});

export const Customer = entity("customers", {
  id: field.uuid().primary(),
  name: field.text().required(),
  email: field.email(),
  countryId: field.lookup(Country, { label: "name" }),
});`}</CodeBlock>

      <h2>2. Create the server app</h2>
      <CodeBlock>{`import { createDataCanvas } from "@datacanvas/server";
import { drizzleAdapter } from "@datacanvas/adapter-drizzle";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const db = drizzle(postgres(process.env.DATABASE_URL!));

export const app = createDataCanvas({
  entities: [Country, Customer],
  adapter: drizzleAdapter(db),
});`}</CodeBlock>

      <h2>3. Mount the API (Next.js App Router)</h2>
      <p>
        Create <code>app/api/datacanvas/[[...path]]/route.ts</code> and re-export the handlers:
      </p>
      <CodeBlock>{`import { app } from "@/lib/datacanvas";

export const GET = app.handlers.GET;
export const POST = app.handlers.POST;
export const PATCH = app.handlers.PATCH;
export const DELETE = app.handlers.DELETE;`}</CodeBlock>

      <h2>4. Render screens</h2>
      <CodeBlock>{`"use client";
import { DataCanvasProvider, EntityScreen } from "@datacanvas/react";
import "@datacanvas/react/styles.css";

export default function CustomersPage() {
  return (
    <DataCanvasProvider baseUrl="/api/datacanvas">
      <EntityScreen entity={Customer} />
    </DataCanvasProvider>
  );
}`}</CodeBlock>
      <p>
        That single component gives you a sortable, paginated grid with search, a create/edit modal
        form with validation, lookup selects, and a delete confirmation — all generated from the
        entity metadata.
      </p>

      <h2>Running without PostgreSQL</h2>
      <p>
        For tests and demos, <code>@datacanvas/server</code> ships an in-memory adapter with the
        same contract:
      </p>
      <CodeBlock>{`import { createMemoryAdapter } from "@datacanvas/server";

const app = createDataCanvas({
  entities: [Country, Customer],
  adapter: createMemoryAdapter({ seed: { countries: [...] } }),
});`}</CodeBlock>
    </>
  );
}
