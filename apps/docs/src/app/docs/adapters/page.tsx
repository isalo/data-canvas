import { CodeBlock } from "@/components/CodeBlock";

export default function AdaptersPage() {
  return (
    <>
      <h1>Database adapters</h1>
      <p>
        The server never talks to a database directly. It only knows the <code>DataAdapter</code>{" "}
        contract defined in <code>@data-canvas/core</code>:
      </p>
      <CodeBlock>{`interface DataAdapter {
  list(entity, query): Promise<{ rows; total }>;
  getById(entity, id): Promise<row | null>;
  create(entity, values): Promise<row>;
  update(entity, id, values): Promise<row | null>;
  delete(entity, id): Promise<boolean>;
}`}</CodeBlock>

      <h2>Drizzle / PostgreSQL</h2>
      <CodeBlock>{`import { drizzleAdapter } from "@data-canvas/adapter-drizzle";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const db = drizzle(postgres(process.env.DATABASE_URL!));
const adapter = drizzleAdapter(db);`}</CodeBlock>
      <p>
        Tables are derived from entity metadata on first use — camelCase field names map to
        snake_case columns (<code>countryId</code> → <code>country_id</code>). If you need the
        generated tables for custom queries or drizzle-kit, use <code>createTables(entities)</code>.
      </p>

      <h2>In-memory</h2>
      <CodeBlock>{`import { createMemoryAdapter } from "@data-canvas/server";

const adapter = createMemoryAdapter({
  seed: { countries: [{ id: "...", name: "Japan", code: "JP" }] },
});`}</CodeBlock>
      <p>
        Implements the full contract (filters, search, sorting, pagination) without any
        dependencies. The test suite and the live demo fallback both run on it.
      </p>

      <h2>Writing your own</h2>
      <p>
        Implement the five methods against any storage — SQLite, an HTTP API, a key-value store.
        Entity metadata gives you field kinds, the primary key and searchable fields; the normalized{" "}
        <code>ListQuery</code> gives you sanitized pagination, sorting and filters.
      </p>
    </>
  );
}
