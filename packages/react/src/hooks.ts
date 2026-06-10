import { type AnyEntity, type EntityRow, type FieldMeta } from "@datacanvas/core";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ClientListQuery } from "./client";
import { useDataCanvas } from "./context";

function listKey(entityName: string, query?: ClientListQuery) {
  return query === undefined
    ? ["datacanvas", entityName]
    : ["datacanvas", entityName, "list", query];
}

/** Server-side paginated list of entity records. */
export function useEntityList(entity: AnyEntity, query: ClientListQuery = {}) {
  const client = useDataCanvas();
  return useQuery({
    queryKey: listKey(entity.name, query),
    queryFn: () => client.list(entity.name, query),
    placeholderData: keepPreviousData,
  });
}

/** Create / update / delete mutations that invalidate the entity's queries. */
export function useEntityMutations(entity: AnyEntity) {
  const client = useDataCanvas();
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["datacanvas", entity.name] });

  const create = useMutation({
    mutationFn: (values: EntityRow) => client.create(entity.name, values),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, values }: { id: string; values: EntityRow }) =>
      client.update(entity.name, id, values),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => client.remove(entity.name, id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

export interface LookupOption {
  value: string;
  label: string;
}

const LOOKUP_PAGE_SIZE = 200;

/**
 * Options for a lookup field: `[{ value: id, label: row[labelField] }]`.
 * Cached per target entity, so many cells/inputs share a single request.
 */
export function useLookupOptions(field: FieldMeta) {
  const client = useDataCanvas();
  const lookup = field.lookup;

  const query = useQuery({
    queryKey: ["datacanvas", lookup?.entity.name ?? "none", "lookup", lookup?.label],
    queryFn: () =>
      client.list(lookup!.entity.name, {
        pageSize: LOOKUP_PAGE_SIZE,
        sortBy: lookup!.label,
        sortDir: "asc",
      }),
    enabled: Boolean(lookup),
    staleTime: 30_000,
  });

  const options: LookupOption[] = lookup
    ? (query.data?.data ?? []).map((row) => ({
        value: String(row[lookup.entity.primaryKey]),
        label: String(row[lookup.label] ?? ""),
      }))
    : [];

  return { options, isLoading: query.isLoading };
}
