import { describe, expect, it } from "vitest";
import { camelToSnake, humanize, lookupLabel } from "./naming";

describe("naming", () => {
  it("humanizes camelCase and snake_case", () => {
    expect(humanize("unitPrice")).toBe("Unit Price");
    expect(humanize("order_items")).toBe("Order Items");
    expect(humanize("name")).toBe("Name");
  });

  it("derives lookup labels by stripping Id suffixes", () => {
    expect(lookupLabel("countryId")).toBe("Country");
    expect(lookupLabel("customer_id")).toBe("Customer");
    expect(lookupLabel("id")).toBe("Id");
  });

  it("converts camelCase to snake_case", () => {
    expect(camelToSnake("countryId")).toBe("country_id");
    expect(camelToSnake("name")).toBe("name");
  });
});
