import { type z } from "zod";
import { type AnyFieldBuilder, type FieldBuilder, type FieldMeta } from "./fields";
import { humanize, lookupLabel } from "./naming";
import { buildInsertSchema, buildUpdateSchema } from "./validation";

export interface EntityOptions {
  /** Display title. Defaults to a humanized version of the entity name. */
  title?: string;
}

/**
 * Immutable entity description produced by `entity()`. This metadata is the
 * single source of truth consumed by the server (API + validation), database
 * adapters (tables/columns) and React components (grids, forms, lookups).
 */
export interface Entity<TFields extends Record<string, AnyFieldBuilder> = any> {
  readonly name: string;
  readonly title: string;
  readonly fields: { readonly [K in keyof TFields]: FieldMeta };
  readonly primaryKey: Extract<keyof TFields, string>;
  /** Zod schema for creating records (primary key optional, defaults applied). */
  readonly insertSchema: z.ZodTypeAny;
  /** Zod schema for partial updates. */
  readonly updateSchema: z.ZodTypeAny;
}

export type AnyEntity = Entity<any>;

/** A database row matching an entity, as plain JSON. */
export type EntityRow = Record<string, unknown>;

/** Infers the row type from an entity definition. Optional fields become `T | null`. */
export type InferRow<E extends AnyEntity> =
  E extends Entity<infer F>
    ? {
        [K in keyof F]: F[K] extends FieldBuilder<infer T, infer R>
          ? R extends true
            ? T
            : T | null
          : never;
      }
    : never;

/**
 * Defines an entity from a name and a record of field builders:
 *
 * ```ts
 * export const Country = entity("countries", {
 *   id: field.uuid().primary(),
 *   name: field.text().required(),
 * });
 * ```
 */
export function entity<TFields extends Record<string, AnyFieldBuilder>>(
  name: string,
  fields: TFields,
  options: EntityOptions = {},
): Entity<TFields> {
  const metas: Record<string, FieldMeta> = {};
  for (const [key, builder] of Object.entries(fields)) {
    const meta = { ...builder.meta };
    if (!meta.label) {
      meta.label = meta.kind === "lookup" ? lookupLabel(key) : humanize(key);
    }
    metas[key] = meta;
  }

  const primaryKeys = Object.keys(metas).filter((key) => metas[key].primary);
  if (primaryKeys.length !== 1) {
    throw new Error(
      `Entity "${name}" must declare exactly one primary field, found ${primaryKeys.length}.`,
    );
  }
  const primaryKey = primaryKeys[0];

  return {
    name,
    title: options.title ?? humanize(name),
    fields: metas as Entity<TFields>["fields"],
    primaryKey: primaryKey as Extract<keyof TFields, string>,
    insertSchema: buildInsertSchema(metas, primaryKey),
    updateSchema: buildUpdateSchema(metas, primaryKey),
  };
}

/** Field names of an entity in declaration order. */
export function fieldNames(e: AnyEntity): string[] {
  return Object.keys(e.fields);
}

/** Fields that should be searched by free-text search (text + email). */
export function searchableFields(e: AnyEntity): string[] {
  return Object.entries(e.fields as Record<string, FieldMeta>)
    .filter(([, meta]) => meta.kind === "text" || meta.kind === "email")
    .map(([key]) => key);
}
