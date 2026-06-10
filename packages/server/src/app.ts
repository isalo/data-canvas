import { type AnyEntity, type DataAdapter, type EntityRow } from "@datacanvas/core";
import { errorResponse, json } from "./http";
import { parseListQuery } from "./query";

export interface DataCanvasConfig {
  entities: AnyEntity[];
  adapter: DataAdapter;
}

export type RouteHandler = (req: Request) => Promise<Response>;

export interface DataCanvasApp {
  entities: AnyEntity[];
  adapter: DataAdapter;
  /** Single handler that routes by method + path. */
  handler: RouteHandler;
  /** The same handler exposed per method, ready to re-export from a Next.js route file. */
  handlers: {
    GET: RouteHandler;
    POST: RouteHandler;
    PATCH: RouteHandler;
    DELETE: RouteHandler;
  };
}

interface Route {
  entity: AnyEntity;
  id?: string;
}

/**
 * Creates a DataCanvas server app: one fetch-style handler that serves CRUD
 * endpoints for every registered entity.
 *
 *   GET    .../:entity        list (pagination, sorting, search, filters)
 *   GET    .../:entity/:id    read one
 *   POST   .../:entity        create (validated with the entity insert schema)
 *   PATCH  .../:entity/:id    partial update (validated with the update schema)
 *   DELETE .../:entity/:id    delete
 *
 * The handler is mount-point agnostic: it finds the entity segment anywhere
 * in the path, so it works under `/api/datacanvas`, `/api/data` or any other
 * base path without configuration.
 */
export function createDataCanvas(config: DataCanvasConfig): DataCanvasApp {
  const { entities, adapter } = config;
  const entityMap = new Map(entities.map((e) => [e.name, e]));

  function resolveRoute(pathname: string): Route | null {
    const segments = pathname.split("/").filter(Boolean);
    for (let i = segments.length - 1; i >= 0; i--) {
      const entity = entityMap.get(decodeURIComponent(segments[i]));
      if (entity) {
        return { entity, id: segments[i + 1] ? decodeURIComponent(segments[i + 1]) : undefined };
      }
    }
    return null;
  }

  async function readBody(req: Request): Promise<EntityRow | null> {
    try {
      const body = (await req.json()) as unknown;
      return body && typeof body === "object" ? (body as EntityRow) : null;
    } catch {
      return null;
    }
  }

  const handler: RouteHandler = async (req) => {
    const url = new URL(req.url);
    const route = resolveRoute(url.pathname);
    if (!route) return errorResponse(404, "Unknown entity.");
    const { entity, id } = route;

    try {
      switch (req.method) {
        case "GET": {
          if (id) {
            const row = await adapter.getById(entity, id);
            if (!row) return errorResponse(404, `${entity.title} record not found.`);
            return json(200, { data: row });
          }
          const query = parseListQuery(entity, url.searchParams);
          const { rows, total } = await adapter.list(entity, query);
          return json(200, { data: rows, page: query.page, pageSize: query.pageSize, total });
        }

        case "POST": {
          const body = await readBody(req);
          if (!body) return errorResponse(400, "Expected a JSON object body.");
          const parsed = entity.insertSchema.safeParse(body);
          if (!parsed.success) {
            return errorResponse(400, "Validation failed.", parsed.error.issues);
          }
          const row = await adapter.create(entity, parsed.data as EntityRow);
          return json(201, { data: row });
        }

        case "PATCH": {
          if (!id) return errorResponse(400, "Missing record id in path.");
          const body = await readBody(req);
          if (!body) return errorResponse(400, "Expected a JSON object body.");
          const parsed = entity.updateSchema.safeParse(body);
          if (!parsed.success) {
            return errorResponse(400, "Validation failed.", parsed.error.issues);
          }
          const row = await adapter.update(entity, id, parsed.data as EntityRow);
          if (!row) return errorResponse(404, `${entity.title} record not found.`);
          return json(200, { data: row });
        }

        case "DELETE": {
          if (!id) return errorResponse(400, "Missing record id in path.");
          const deleted = await adapter.delete(entity, id);
          if (!deleted) return errorResponse(404, `${entity.title} record not found.`);
          return json(200, { data: { id } });
        }

        default:
          return errorResponse(405, `Method ${req.method} is not supported.`);
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Internal error.";
      return errorResponse(500, message);
    }
  };

  return {
    entities,
    adapter,
    handler,
    handlers: { GET: handler, POST: handler, PATCH: handler, DELETE: handler },
  };
}
