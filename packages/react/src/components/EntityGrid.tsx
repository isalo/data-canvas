import { type AnyEntity, type EntityRow, type FieldMeta } from "@data-canvas/core";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { CellValue } from "./CellValue";

export interface EntityGridProps {
  entity: AnyEntity;
  rows: EntityRow[];
  total: number;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir: "asc" | "desc";
  loading?: boolean;
  onSort: (fieldName: string) => void;
  onPageChange: (page: number) => void;
  onEdit?: (row: EntityRow) => void;
  onDelete?: (row: EntityRow) => void;
  onRowClick?: (row: EntityRow) => void;
  /** Id of the currently selected row (used for master/detail highlighting). */
  selectedId?: string | null;
}

/**
 * Server-driven data grid. Columns come from entity metadata, while sorting
 * and pagination are controlled by the parent (usually EntityScreen).
 */
export function EntityGrid({
  entity,
  rows,
  total,
  page,
  pageSize,
  sortBy,
  sortDir,
  loading,
  onSort,
  onPageChange,
  onEdit,
  onDelete,
  onRowClick,
  selectedId,
}: EntityGridProps) {
  const columns = useMemo<ColumnDef<EntityRow>[]>(() => {
    return Object.entries(entity.fields as Record<string, FieldMeta>)
      .filter(([, meta]) => !meta.primary)
      .map(([fieldName, meta]) => ({
        id: fieldName,
        accessorKey: fieldName,
        header: meta.label ?? fieldName,
        cell: (info) => <CellValue field={meta} value={info.getValue()} />,
      }));
  }, [entity]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  });

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <div className="dc-grid">
      <div className="dc-grid-scroll">
        <table className="dc-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    <button
                      type="button"
                      className="dc-th-button"
                      onClick={() => onSort(header.column.id)}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {sortBy === header.column.id && (
                        <span className="dc-sort-indicator">{sortDir === "asc" ? "▲" : "▼"}</span>
                      )}
                    </button>
                  </th>
                ))}
                {hasActions && <th className="dc-th-actions" />}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const original = row.original;
              const id = String(original[entity.primaryKey]);
              return (
                <tr
                  key={row.id}
                  className={[
                    onRowClick ? "dc-row-clickable" : "",
                    selectedId === id ? "dc-row-selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={onRowClick ? () => onRowClick(original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="dc-td-actions" onClick={(event) => event.stopPropagation()}>
                      {onEdit && (
                        <button
                          type="button"
                          className="dc-btn dc-btn-ghost"
                          onClick={() => onEdit(original)}
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          className="dc-btn dc-btn-ghost dc-btn-danger"
                          onClick={() => onDelete(original)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td className="dc-empty" colSpan={columns.length + (hasActions ? 1 : 0)}>
                  {loading ? "Loading…" : "No records found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="dc-pagination">
        <span className="dc-muted">
          {total} record{total === 1 ? "" : "s"}
        </span>
        <div className="dc-pagination-controls">
          <button
            type="button"
            className="dc-btn"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            ‹ Prev
          </button>
          <span className="dc-muted">
            Page {page} of {pageCount}
          </span>
          <button
            type="button"
            className="dc-btn"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            Next ›
          </button>
        </div>
      </div>
    </div>
  );
}
