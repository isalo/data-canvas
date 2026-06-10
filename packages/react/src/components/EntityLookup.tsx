import { type FieldMeta } from "@datacanvas/core";
import { useLookupOptions } from "../hooks";

export interface EntityLookupProps {
  /** A field with `kind: "lookup"` metadata. */
  field: FieldMeta;
  value: string | null;
  onChange: (value: string | null) => void;
  id?: string;
  disabled?: boolean;
}

/** Select input for lookup fields, loading options from the referenced entity. */
export function EntityLookup({ field, value, onChange, id, disabled }: EntityLookupProps) {
  const { options, isLoading } = useLookupOptions(field);

  return (
    <select
      id={id}
      className="dc-input"
      value={value ?? ""}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value === "" ? null : event.target.value)}
    >
      <option value="">{isLoading ? "Loading…" : "— None —"}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
