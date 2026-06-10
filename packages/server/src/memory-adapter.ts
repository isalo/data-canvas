import {
  searchableFields,
  type AnyEntity,
  type DataAdapter,
  type EntityRow,
  type ListQuery,
  type ListResult,
} from "@data-canvas/core";

export interface MemoryAdapterOptions {
  /** Initial rows keyed by entity name, e.g. `{ countries: [...] }`. */
  seed?: Record<string, EntityRow[]>;
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return String(a).localeCompare(String(b));
}

/**
 * In-memory implementation of the adapter contract. Used by the test suite
 * and as a zero-setup fallback for demos — no persistence, no dependencies.
 */
export function createMemoryAdapter(options: MemoryAdapterOptions = {}): DataAdapter {
  const stores = new Map<string, Map<string, EntityRow>>();

  function store(entity: AnyEntity): Map<string, EntityRow> {
    let existing = stores.get(entity.name);
    if (!existing) {
      existing = new Map();
      for (const row of options.seed?.[entity.name] ?? []) {
        existing.set(String(row[entity.primaryKey]), { ...row });
      }
      stores.set(entity.name, existing);
    }
    return existing;
  }

  /** Fills in nulls for fields that were not provided. */
  function normalize(entity: AnyEntity, values: EntityRow): EntityRow {
    const row: EntityRow = {};
    for (const key of Object.keys(entity.fields)) {
      row[key] = values[key] ?? null;
    }
    return row;
  }

  return {
    async list(entity: AnyEntity, query: ListQuery): Promise<ListResult> {
      let rows = [...store(entity).values()];

      for (const [key, value] of Object.entries(query.filter)) {
        rows = rows.filter((row) => String(row[key]) === value);
      }

      if (query.search) {
        const needle = query.search.toLowerCase();
        const fields = searchableFields(entity);
        rows = rows.filter((row) =>
          fields.some((f) =>
            String(row[f] ?? "")
              .toLowerCase()
              .includes(needle),
          ),
        );
      }

      const sortBy = query.sortBy;
      if (sortBy) {
        rows.sort((a, b) => compareValues(a[sortBy], b[sortBy]));
        if (query.sortDir === "desc") rows.reverse();
      }

      const total = rows.length;
      const start = (query.page - 1) * query.pageSize;
      return {
        rows: rows.slice(start, start + query.pageSize).map((row) => ({ ...row })),
        total,
      };
    },

    async getById(entity, id) {
      const row = store(entity).get(id);
      return row ? { ...row } : null;
    },

    async create(entity, values) {
      const id = (values[entity.primaryKey] as string | undefined) ?? crypto.randomUUID();
      const row = { ...normalize(entity, values), [entity.primaryKey]: id };
      store(entity).set(id, row);
      return { ...row };
    },

    async update(entity, id, values) {
      const existing = store(entity).get(id);
      if (!existing) return null;
      const row = { ...existing, ...values, [entity.primaryKey]: id };
      store(entity).set(id, row);
      return { ...row };
    },

    async delete(entity, id) {
      return store(entity).delete(id);
    },
  };
}
