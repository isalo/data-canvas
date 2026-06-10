import { type AnyEntity } from "./entity";

export type FieldKind = "text" | "email" | "number" | "boolean" | "date" | "uuid" | "lookup";

export interface LookupConfig {
  /** The entity this field references. */
  entity: AnyEntity;
  /** Field on the referenced entity used as the display label. */
  label: string;
}

/** Plain serializable description of a field. Everything else is derived from this. */
export interface FieldMeta {
  kind: FieldKind;
  primary: boolean;
  required: boolean;
  label?: string;
  lookup?: LookupConfig;
}

/**
 * Chainable field definition, e.g. `field.text().required().label("Full name")`.
 * The two type parameters carry the TypeScript value type and required-ness
 * so that `InferRow` can compute row types from an entity definition.
 */
export class FieldBuilder<TValue, TRequired extends boolean = false> {
  /** Phantom type carrier — never set at runtime, only used for inference. */
  declare readonly __types: { value: TValue; required: TRequired };

  readonly meta: FieldMeta;

  constructor(meta: FieldMeta) {
    this.meta = meta;
  }

  /** Marks this field as the primary key. Implies `required`. */
  primary(): FieldBuilder<TValue, true> {
    this.meta.primary = true;
    this.meta.required = true;
    return this as unknown as FieldBuilder<TValue, true>;
  }

  required(): FieldBuilder<TValue, true> {
    this.meta.required = true;
    return this as unknown as FieldBuilder<TValue, true>;
  }

  /** Overrides the auto-generated label shown in grids and forms. */
  label(text: string): this {
    this.meta.label = text;
    return this;
  }
}

export type AnyFieldBuilder = FieldBuilder<any, boolean>;

function make<TValue>(kind: FieldKind, extra?: Partial<FieldMeta>): FieldBuilder<TValue> {
  return new FieldBuilder<TValue>({ kind, primary: false, required: false, ...extra });
}

export const field = {
  text: () => make<string>("text"),
  email: () => make<string>("email"),
  number: () => make<number>("number"),
  boolean: () => make<boolean>("boolean"),
  /** Stored and transported as an ISO date string (YYYY-MM-DD). */
  date: () => make<string>("date"),
  uuid: () => make<string>("uuid"),
  /**
   * Foreign key to another entity. Rendered as a select in forms and
   * resolved to the referenced entity's label field in grids.
   */
  lookup: <E extends AnyEntity>(entity: E, config: { label: Extract<keyof E["fields"], string> }) =>
    make<string>("lookup", { lookup: { entity, label: config.label } }),
};
