import {
  searchableFields,
  type AnyEntity,
  type DataAdapter,
  type EntityRow,
  type FieldMeta,
} from "@datacanvas/core";
import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { type PgColumn, type PgDatabase } from "drizzle-orm/pg-core";
import { entityToTable, type GeneratedTable } from "./table";

/** Any Drizzle PostgreSQL database instance (postgres-js, node-postgres, neon, ...). */
export type AnyPgDatabase = PgDatabase<any, any, any>;

function column(table: GeneratedTable, name: string): PgColumn {
  return (table as unknown as Record<string, PgColumn>)[name];
}

function coerceFilterValue(meta: FieldMeta, value: string): unknown {
  switch (meta.kind) {
    case "number":
      return Number(value);
    case "boolean":
      return value === "true";
    default:
      return value;
  }
}

/**
 * PostgreSQL persistence via Drizzle ORM. Tables are derived from entity
 * metadata on first use, so the only thing you provide is a database handle:
 *
 * ```ts
 * const db = drizzle(postgres(process.env.DATABASE_URL!));
 * const app = createDataCanvas({ entities, adapter: drizzleAdapter(db) });
 * ```
 */
export function drizzleAdapter(db: AnyPgDatabase): DataAdapter {
  const tables = new Map<string, GeneratedTable>();

  function tableFor(entity: AnyEntity): GeneratedTable {
    let table = tables.get(entity.name);
    if (!table) {
      table = entityToTable(entity);
      tables.set(entity.name, table);
    }
    return table;
  }

  return {
    async list(entity, query) {
      const table = tableFor(entity);
      const conditions: SQL[] = [];

      for (const [fieldName, raw] of Object.entries(query.filter)) {
        const meta = (entity.fields as Record<string, FieldMeta>)[fieldName];
        conditions.push(eq(column(table, fieldName), coerceFilterValue(meta, raw)));
      }

      if (query.search) {
        const matches = searchableFields(entity).map((f) =>
          ilike(column(table, f), `%${query.search}%`),
        );
        if (matches.length > 0) {
          const combined = or(...matches);
          if (combined) conditions.push(combined);
        }
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const sortColumn = column(table, query.sortBy ?? entity.primaryKey);
      const orderBy = query.sortDir === "desc" ? desc(sortColumn) : asc(sortColumn);

      const rows = await db
        .select()
        .from(table)
        .where(where)
        .orderBy(orderBy)
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize);

      const [counted] = await db.select({ total: count() }).from(table).where(where);

      return { rows: rows as EntityRow[], total: counted?.total ?? 0 };
    },

    async getById(entity, id) {
      const table = tableFor(entity);
      const rows = await db
        .select()
        .from(table)
        .where(eq(column(table, entity.primaryKey), id))
        .limit(1);
      return (rows[0] as EntityRow | undefined) ?? null;
    },

    async create(entity, values) {
      const table = tableFor(entity);
      const rows = await db.insert(table).values(values).returning();
      return rows[0] as EntityRow;
    },

    async update(entity, id, values) {
      const table = tableFor(entity);
      if (Object.keys(values).length === 0) {
        return this.getById(entity, id);
      }
      const rows = await db
        .update(table)
        .set(values)
        .where(eq(column(table, entity.primaryKey), id))
        .returning();
      return (rows[0] as EntityRow | undefined) ?? null;
    },

    async delete(entity, id) {
      const table = tableFor(entity);
      const rows = await db
        .delete(table)
        .where(eq(column(table, entity.primaryKey), id))
        .returning();
      return rows.length > 0;
    },
  };
}
