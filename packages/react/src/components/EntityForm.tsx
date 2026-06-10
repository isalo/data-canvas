import { type AnyEntity, type EntityRow, type FieldMeta } from "@datacanvas/core";
import { useState, type FormEvent } from "react";
import { type ZodIssueLike } from "../client";
import { EntityLookup } from "./EntityLookup";

export interface EntityFormProps {
  entity: AnyEntity;
  /** Existing row when editing, or default values when creating. */
  initialValues?: EntityRow;
  onSubmit: (values: EntityRow) => void | Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
  /** Server-side error message to display above the actions. */
  error?: string | null;
  submitLabel?: string;
}

function toInputValue(meta: FieldMeta, value: unknown): unknown {
  if (meta.kind === "boolean") return Boolean(value);
  if (value === null || value === undefined) return "";
  if (meta.kind === "date") return String(value).slice(0, 10);
  return value;
}

function initialState(entity: AnyEntity, initialValues?: EntityRow): EntityRow {
  const state: EntityRow = {};
  for (const [fieldName, meta] of Object.entries(entity.fields as Record<string, FieldMeta>)) {
    if (meta.primary) continue;
    state[fieldName] = toInputValue(meta, initialValues?.[fieldName]);
  }
  return state;
}

/**
 * Metadata-driven form. Inputs are derived from field kinds, values are
 * validated with the entity's Zod schema before `onSubmit` is called.
 */
export function EntityForm({
  entity,
  initialValues,
  onSubmit,
  onCancel,
  submitting,
  error,
  submitLabel = "Save",
}: EntityFormProps) {
  const [values, setValues] = useState<EntityRow>(() => initialState(entity, initialValues));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setValue = (fieldName: string, value: unknown) =>
    setValues((current) => ({ ...current, [fieldName]: value }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = entity.insertSchema.safeParse(values);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues as ZodIssueLike[]) {
        const key = String(issue.path[0] ?? "");
        if (key && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    await onSubmit(parsed.data as EntityRow);
  }

  return (
    <form className="dc-form" onSubmit={handleSubmit} noValidate>
      {Object.entries(entity.fields as Record<string, FieldMeta>)
        .filter(([, meta]) => !meta.primary)
        .map(([fieldName, meta]) => {
          const inputId = `dc-field-${entity.name}-${fieldName}`;
          const fieldError = fieldErrors[fieldName];
          return (
            <div key={fieldName} className="dc-form-field">
              <label className="dc-label" htmlFor={inputId}>
                {meta.label ?? fieldName}
                {meta.required && meta.kind !== "boolean" && <span className="dc-required">*</span>}
              </label>
              <FieldInput
                meta={meta}
                inputId={inputId}
                value={values[fieldName]}
                disabled={submitting}
                onChange={(value) => setValue(fieldName, value)}
              />
              {fieldError && <span className="dc-field-error">{fieldError}</span>}
            </div>
          );
        })}

      {error && <div className="dc-form-error">{error}</div>}

      <div className="dc-form-actions">
        {onCancel && (
          <button type="button" className="dc-btn" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="dc-btn dc-btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

interface FieldInputProps {
  meta: FieldMeta;
  inputId: string;
  value: unknown;
  disabled?: boolean;
  onChange: (value: unknown) => void;
}

function FieldInput({ meta, inputId, value, disabled, onChange }: FieldInputProps) {
  switch (meta.kind) {
    case "lookup":
      return (
        <EntityLookup
          field={meta}
          id={inputId}
          value={typeof value === "string" && value !== "" ? value : null}
          disabled={disabled}
          onChange={(next) => onChange(next ?? "")}
        />
      );
    case "boolean":
      return (
        <input
          id={inputId}
          type="checkbox"
          className="dc-checkbox"
          checked={Boolean(value)}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
      );
    case "number":
      return (
        <input
          id={inputId}
          type="number"
          step="any"
          className="dc-input"
          value={String(value ?? "")}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case "date":
      return (
        <input
          id={inputId}
          type="date"
          className="dc-input"
          value={String(value ?? "")}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case "email":
      return (
        <input
          id={inputId}
          type="email"
          className="dc-input"
          value={String(value ?? "")}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    default:
      return (
        <input
          id={inputId}
          type="text"
          className="dc-input"
          value={String(value ?? "")}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      );
  }
}
