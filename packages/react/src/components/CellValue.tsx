import { type FieldMeta } from "@data-canvas/core";
import { useLookupOptions } from "../hooks";

function LookupCell({ field, value }: { field: FieldMeta; value: string }) {
  const { options } = useLookupOptions(field);
  const match = options.find((option) => option.value === value);
  return <>{match ? match.label : value}</>;
}

/** Renders a single grid cell based on field metadata. */
export function CellValue({ field, value }: { field: FieldMeta; value: unknown }) {
  if (value === null || value === undefined || value === "") {
    return <span className="dc-muted">—</span>;
  }

  switch (field.kind) {
    case "lookup":
      return <LookupCell field={field} value={String(value)} />;
    case "boolean":
      return value ? (
        <span className="dc-badge dc-badge-yes">Yes</span>
      ) : (
        <span className="dc-badge dc-badge-no">No</span>
      );
    case "number":
      return <span className="dc-number">{Number(value).toLocaleString()}</span>;
    default:
      return <>{String(value)}</>;
  }
}
