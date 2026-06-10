import { drizzleAdapter } from "@data-canvas/adapter-drizzle";
import { type DataAdapter } from "@data-canvas/core";
import { createDataCanvas, createMemoryAdapter } from "@data-canvas/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { allEntities } from "./entities";
import { seed } from "./seed";

// With DATABASE_URL set (see .env.example + docker-compose.yml) the demo
// persists to PostgreSQL through Drizzle. Without it, it falls back to a
// seeded in-memory adapter so the demo runs anywhere with zero setup.
function createAdapter(): DataAdapter {
  const url = process.env.DATABASE_URL;
  if (url) {
    return drizzleAdapter(drizzle(postgres(url)));
  }
  console.warn("[datacanvas demo] DATABASE_URL is not set — using the in-memory adapter.");
  return createMemoryAdapter({ seed });
}

export const app = createDataCanvas({
  entities: allEntities,
  adapter: createAdapter(),
});
