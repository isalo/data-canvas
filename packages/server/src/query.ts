import { type AnyEntity, type ListQuery } from "@datacanvas/core";

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Parses and sanitizes list query params. Unknown sort/filter fields are
 * dropped rather than rejected so clients can never reach raw column names.
 *
 * Supported params:
 *   ?page=1&pageSize=20&sortBy=name&sortDir=desc&search=ada&filter.countryId=<uuid>
 */
export function parseListQuery(entity: AnyEntity, params: URLSearchParams): ListQuery {
  const page = Math.max(1, Number(params.get("page")) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number(params.get("pageSize")) || DEFAULT_PAGE_SIZE),
  );

  let sortBy = params.get("sortBy") ?? undefined;
  if (sortBy && !(sortBy in entity.fields)) sortBy = undefined;
  const sortDir = params.get("sortDir") === "desc" ? "desc" : "asc";

  const search = params.get("search")?.trim() || undefined;

  const filter: Record<string, string> = {};
  for (const [key, value] of params) {
    if (!key.startsWith("filter.")) continue;
    const fieldName = key.slice("filter.".length);
    if (fieldName in entity.fields) filter[fieldName] = value;
  }

  return { page, pageSize, sortBy, sortDir, search, filter };
}
