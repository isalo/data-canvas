/**
 * Turns identifiers like "countryId", "order_items" or "unitPrice"
 * into human-friendly labels like "Country Id", "Order Items", "Unit Price".
 */
export function humanize(input: string): string {
  return input
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Default label for a lookup field: "countryId" -> "Country". */
export function lookupLabel(fieldName: string): string {
  const stripped = fieldName.replace(/_?[iI]d$/, "");
  return humanize(stripped.length > 0 ? stripped : fieldName);
}

/** "countryId" -> "country_id". Used by database adapters. */
export function camelToSnake(input: string): string {
  return input.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}
