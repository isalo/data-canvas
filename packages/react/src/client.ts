import { type EntityRow } from "@data-canvas/core";

export interface ClientListQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  search?: string;
  filter?: Record<string, unknown>;
}

export interface ListResponse {
  data: EntityRow[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ZodIssueLike {
  path: (string | number)[];
  message: string;
}

/** Error thrown for non-2xx API responses, carrying validation issues if any. */
export class ApiError extends Error {
  readonly status: number;
  readonly issues: ZodIssueLike[];

  constructor(status: number, message: string, issues: ZodIssueLike[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
  }
}

export interface DataCanvasClient {
  baseUrl: string;
  list(entityName: string, query?: ClientListQuery): Promise<ListResponse>;
  get(entityName: string, id: string): Promise<EntityRow>;
  create(entityName: string, values: EntityRow): Promise<EntityRow>;
  update(entityName: string, id: string, values: EntityRow): Promise<EntityRow>;
  remove(entityName: string, id: string): Promise<void>;
}

function buildSearchParams(query: ClientListQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.sortBy) {
    params.set("sortBy", query.sortBy);
    params.set("sortDir", query.sortDir ?? "asc");
  }
  if (query.search) params.set("search", query.search);
  for (const [key, value] of Object.entries(query.filter ?? {})) {
    if (value !== undefined && value !== null) params.set(`filter.${key}`, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = body?.error as { message?: string; issues?: ZodIssueLike[] } | undefined;
    throw new ApiError(
      response.status,
      error?.message ?? `Request failed with status ${response.status}`,
      error?.issues ?? [],
    );
  }
  return body as T;
}

export function createClient(baseUrl: string): DataCanvasClient {
  const base = baseUrl.replace(/\/$/, "");
  return {
    baseUrl: base,
    async list(entityName, query = {}) {
      return request<ListResponse>(`${base}/${entityName}${buildSearchParams(query)}`);
    },
    async get(entityName, id) {
      const body = await request<{ data: EntityRow }>(`${base}/${entityName}/${id}`);
      return body.data;
    },
    async create(entityName, values) {
      const body = await request<{ data: EntityRow }>(`${base}/${entityName}`, {
        method: "POST",
        body: JSON.stringify(values),
      });
      return body.data;
    },
    async update(entityName, id, values) {
      const body = await request<{ data: EntityRow }>(`${base}/${entityName}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      return body.data;
    },
    async remove(entityName, id) {
      await request(`${base}/${entityName}/${id}`, { method: "DELETE" });
    },
  };
}
