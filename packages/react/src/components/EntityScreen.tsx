import { type AnyEntity, type EntityRow } from "@data-canvas/core";
import { useEffect, useState } from "react";
import { ApiError } from "../client";
import { useEntityList, useEntityMutations } from "../hooks";
import { EntityForm } from "./EntityForm";
import { EntityGrid } from "./EntityGrid";
import { Modal } from "./Modal";

export interface EntityScreenProps {
  entity: AnyEntity;
  /** Heading shown above the grid. Defaults to the entity title. */
  title?: string;
  pageSize?: number;
  /** Static equality filters applied to the list (e.g. `{ orderId }` for detail screens). */
  filter?: Record<string, unknown>;
  /** Default values for newly created records (e.g. the master record's id). */
  initialValues?: EntityRow;
  /** Enables row selection, e.g. for master/detail screens. */
  onRowClick?: (row: EntityRow) => void;
  selectedId?: string | null;
}

type DialogState = { mode: "create" } | { mode: "edit"; row: EntityRow } | null;

/**
 * Batteries-included CRUD screen: toolbar with search and a create button,
 * a sortable paginated grid, and modal create/edit/delete flows — all derived
 * from entity metadata. For custom UIs, compose EntityGrid/EntityForm and the
 * hooks directly instead.
 */
export function EntityScreen({
  entity,
  title,
  pageSize = 10,
  filter,
  initialValues,
  onRowClick,
  selectedId,
}: EntityScreenProps) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [pendingDelete, setPendingDelete] = useState<EntityRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const filterKey = JSON.stringify(filter ?? {});
  useEffect(() => {
    setPage(1);
  }, [filterKey, search]);

  const list = useEntityList(entity, {
    page,
    pageSize,
    sortBy,
    sortDir,
    search: search || undefined,
    filter,
  });
  const { create, update, remove } = useEntityMutations(entity);

  function handleSort(fieldName: string) {
    if (sortBy === fieldName) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(fieldName);
      setSortDir("asc");
    }
  }

  function closeDialog() {
    setDialog(null);
    setFormError(null);
  }

  async function handleSubmit(values: EntityRow) {
    setFormError(null);
    try {
      if (dialog?.mode === "edit") {
        const id = String(dialog.row[entity.primaryKey]);
        await update.mutateAsync({ id, values });
      } else {
        await create.mutateAsync(values);
      }
      closeDialog();
    } catch (cause) {
      setFormError(cause instanceof ApiError ? cause.message : "Something went wrong.");
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync(String(pendingDelete[entity.primaryKey]));
    } finally {
      setPendingDelete(null);
    }
  }

  const screenTitle = title ?? entity.title;
  const rows = list.data?.data ?? [];
  const total = list.data?.total ?? 0;

  return (
    <section className="dc-screen">
      <header className="dc-toolbar">
        <h2 className="dc-screen-title">{screenTitle}</h2>
        <div className="dc-toolbar-actions">
          <input
            type="search"
            className="dc-input dc-search"
            placeholder="Search…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button
            type="button"
            className="dc-btn dc-btn-primary"
            onClick={() => setDialog({ mode: "create" })}
          >
            New
          </button>
        </div>
      </header>

      {list.isError && (
        <div className="dc-form-error">Failed to load data: {String(list.error)}</div>
      )}

      <EntityGrid
        entity={entity}
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        sortBy={sortBy}
        sortDir={sortDir}
        loading={list.isPending}
        onSort={handleSort}
        onPageChange={setPage}
        onEdit={(row) => setDialog({ mode: "edit", row })}
        onDelete={setPendingDelete}
        onRowClick={onRowClick}
        selectedId={selectedId}
      />

      {dialog && (
        <Modal
          title={dialog.mode === "edit" ? `Edit ${screenTitle}` : `New ${screenTitle}`}
          onClose={closeDialog}
        >
          <EntityForm
            entity={entity}
            initialValues={dialog.mode === "edit" ? dialog.row : initialValues}
            onSubmit={handleSubmit}
            onCancel={closeDialog}
            submitting={create.isPending || update.isPending}
            error={formError}
            submitLabel={dialog.mode === "edit" ? "Save" : "Create"}
          />
        </Modal>
      )}

      {pendingDelete && (
        <Modal title="Confirm delete" onClose={() => setPendingDelete(null)}>
          <p className="dc-confirm-text">Delete this record? This action cannot be undone.</p>
          <div className="dc-form-actions">
            <button type="button" className="dc-btn" onClick={() => setPendingDelete(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="dc-btn dc-btn-primary dc-btn-danger-solid"
              disabled={remove.isPending}
              onClick={handleDelete}
            >
              {remove.isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
