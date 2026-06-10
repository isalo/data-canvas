import { entity, field } from "@data-canvas/core";
import { beforeEach, describe, expect, it } from "vitest";
import { createDataCanvas, type DataCanvasApp } from "./app";
import { createMemoryAdapter } from "./memory-adapter";

const Country = entity("countries", {
  id: field.uuid().primary(),
  name: field.text().required(),
});

const Customer = entity("customers", {
  id: field.uuid().primary(),
  name: field.text().required(),
  email: field.email(),
  countryId: field.lookup(Country, { label: "name" }),
});

const UK = "00000000-0000-4000-8000-000000000001";
const DE = "00000000-0000-4000-8000-000000000002";

function buildApp(): DataCanvasApp {
  return createDataCanvas({
    entities: [Country, Customer],
    adapter: createMemoryAdapter({
      seed: {
        countries: [
          { id: UK, name: "United Kingdom" },
          { id: DE, name: "Germany" },
        ],
        customers: [
          {
            id: crypto.randomUUID(),
            name: "Ada Lovelace",
            email: "ada@example.com",
            countryId: UK,
          },
          {
            id: crypto.randomUUID(),
            name: "Grace Hopper",
            email: "grace@example.com",
            countryId: null,
          },
          {
            id: crypto.randomUUID(),
            name: "Konrad Zuse",
            email: "konrad@example.com",
            countryId: DE,
          },
        ],
      },
    }),
  });
}

const BASE = "http://localhost/api/datacanvas";

function get(app: DataCanvasApp, path: string) {
  return app.handlers.GET(new Request(`${BASE}${path}`));
}

function send(
  app: DataCanvasApp,
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
) {
  return app.handler(
    new Request(`${BASE}${path}`, {
      method,
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
}

describe("createDataCanvas handlers", () => {
  let app: DataCanvasApp;

  beforeEach(() => {
    app = buildApp();
  });

  it("lists records with pagination metadata", async () => {
    const res = await get(app, "/customers");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(3);
    expect(body.page).toBe(1);
    expect(body.data).toHaveLength(3);
  });

  it("paginates", async () => {
    const res = await get(app, "/customers?page=2&pageSize=2&sortBy=name");
    const body = await res.json();
    expect(body.total).toBe(3);
    expect(body.data).toHaveLength(1);
  });

  it("sorts descending", async () => {
    const res = await get(app, "/customers?sortBy=name&sortDir=desc");
    const body = await res.json();
    expect(body.data[0].name).toBe("Konrad Zuse");
  });

  it("searches across text and email fields", async () => {
    const res = await get(app, "/customers?search=grace");
    const body = await res.json();
    expect(body.total).toBe(1);
    expect(body.data[0].name).toBe("Grace Hopper");
  });

  it("filters by field equality", async () => {
    const res = await get(app, `/customers?filter.countryId=${UK}`);
    const body = await res.json();
    expect(body.total).toBe(1);
    expect(body.data[0].name).toBe("Ada Lovelace");
  });

  it("ignores unknown sort and filter fields", async () => {
    const res = await get(app, "/customers?sortBy=secret&filter.secret=x");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(3);
  });

  it("reads a single record", async () => {
    const list = await (await get(app, "/countries")).json();
    const res = await get(app, `/countries/${list.data[0].id}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBeDefined();
  });

  it("creates a record and generates an id", async () => {
    const res = await send(app, "POST", "/customers", {
      name: "Linus Torvalds",
      email: "linus@example.com",
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.id).toMatch(/[0-9a-f-]{36}/);
    expect(body.data.name).toBe("Linus Torvalds");
    expect(body.data.countryId).toBeNull();
  });

  it("rejects invalid payloads with zod issues", async () => {
    const res = await send(app, "POST", "/customers", { email: "not-an-email" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.message).toBe("Validation failed.");
    const paths = body.error.issues.map((i: { path: string[] }) => i.path[0]);
    expect(paths).toContain("name");
    expect(paths).toContain("email");
  });

  it("updates a record partially", async () => {
    const list = await (await get(app, "/customers?search=ada")).json();
    const id = list.data[0].id;
    const res = await send(app, "PATCH", `/customers/${id}`, { name: "Ada King" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe("Ada King");
    expect(body.data.email).toBe("ada@example.com");
  });

  it("deletes a record", async () => {
    const list = await (await get(app, "/customers?search=ada")).json();
    const id = list.data[0].id;
    const res = await send(app, "DELETE", `/customers/${id}`);
    expect(res.status).toBe(200);
    const after = await (await get(app, "/customers")).json();
    expect(after.total).toBe(2);
  });

  it("returns 404 for unknown entities and missing records", async () => {
    expect((await get(app, "/aliens")).status).toBe(404);
    expect((await get(app, `/customers/${crypto.randomUUID()}`)).status).toBe(404);
    expect((await send(app, "DELETE", `/customers/${crypto.randomUUID()}`)).status).toBe(404);
  });

  it("works under any base path", async () => {
    const res = await app.handler(new Request("http://localhost/some/other/mount/customers"));
    expect(res.status).toBe(200);
  });
});
