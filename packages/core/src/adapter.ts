import { type AnyEntity, type EntityRow } from "./entity";

/** Normalized list query produced by the server from request query params. */
export interface ListQuery {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir: "asc" | "desc";
  /** Free-text search across text and email fields. */
  search?: string;
  /** Equality filters keyed by field name (values arrive as strings). */
  filter: Record<string, string>;
}

export interface ListResult {
  rows: EntityRow[];
  total: number;
}

/**
 * Storage contract implemented by database adapters. The server never talks
 * to a database directly — it only knows this interface, which keeps
 * persistence swappable (PostgreSQL, in-memory, anything else).
 */
export interface DataAdapter {
  list(entity: AnyEntity, query: ListQuery): Promise<ListResult>;
  getById(entity: AnyEntity, id: string): Promise<EntityRow | null>;
  create(entity: AnyEntity, values: EntityRow): Promise<EntityRow>;
  update(entity: AnyEntity, id: string, values: EntityRow): Promise<EntityRow | null>;
  delete(entity: AnyEntity, id: string): Promise<boolean>;
}
