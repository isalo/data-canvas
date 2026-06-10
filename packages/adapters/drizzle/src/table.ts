import { camelToSnake, type AnyEntity, type FieldMeta } from "@data-canvas/core";
import {
  boolean,
  date,
  doublePrecision,
  pgTable,
  text,
  uuid,
  type PgColumnBuilderBase,
  type PgTableWithColumns,
} from "drizzle-orm/pg-core";

export type GeneratedTable = PgTableWithColumns<any>;

function buildColumn(fieldName: string, meta: FieldMeta): PgColumnBuilderBase {
  const columnName = camelToSnake(fieldName);

  if (meta.kind === "uuid" || meta.kind === "lookup") {
    const column = uuid(columnName);
    if (meta.primary) return column.defaultRandom().primaryKey();
    return meta.required ? column.notNull() : column;
  }

  const column = (() => {
    switch (meta.kind) {
      case "text":
      case "email":
        return text(columnName);
      case "number":
        return doublePrecision(columnName);
      case "boolean":
        return boolean(columnName);
      case "date":
        return date(columnName); // string mode: matches the ISO date strings used everywhere
    }
  })();

  return meta.required ? column.notNull() : column;
}

/**
 * Derives a Drizzle pgTable from entity metadata. camelCase field names map
 * to snake_case columns (countryId -> country_id).
 */
export function entityToTable(entity: AnyEntity): GeneratedTable {
  const columns: Record<string, PgColumnBuilderBase> = {};
  for (const [fieldName, meta] of Object.entries(entity.fields as Record<string, FieldMeta>)) {
    columns[fieldName] = buildColumn(fieldName, meta);
  }
  return pgTable(entity.name, columns);
}

/**
 * Builds tables for a set of entities, keyed by entity name. Handy for
 * drizzle-kit schema files or for running custom queries against the same
 * tables the adapter uses.
 */
export function createTables(entities: AnyEntity[]): Record<string, GeneratedTable> {
  return Object.fromEntries(entities.map((e) => [e.name, entityToTable(e)]));
}
