import { describe, expect, expectTypeOf, it } from "vitest";
import { entity, searchableFields, type InferRow } from "./entity";
import { field } from "./fields";

const Country = entity("countries", {
  id: field.uuid().primary(),
  name: field.text().required(),
});

const Customer = entity("customers", {
  id: field.uuid().primary(),
  name: field.text().required(),
  email: field.email(),
  active: field.boolean(),
  countryId: field.lookup(Country, { label: "name" }),
});

describe("entity()", () => {
  it("exposes name, title and primary key", () => {
    expect(Customer.name).toBe("customers");
    expect(Customer.title).toBe("Customers");
    expect(Customer.primaryKey).toBe("id");
  });

  it("humanizes entity titles from snake_case names", () => {
    const OrderItem = entity("order_items", { id: field.uuid().primary() });
    expect(OrderItem.title).toBe("Order Items");
  });

  it("generates default labels, stripping Id suffixes from lookups", () => {
    expect(Customer.fields.name.label).toBe("Name");
    expect(Customer.fields.countryId.label).toBe("Country");
  });

  it("keeps explicit labels", () => {
    const e = entity("things", {
      id: field.uuid().primary(),
      code: field.text().label("ISO Code"),
    });
    expect(e.fields.code.label).toBe("ISO Code");
  });

  it("stores lookup metadata", () => {
    expect(Customer.fields.countryId.kind).toBe("lookup");
    expect(Customer.fields.countryId.lookup?.entity.name).toBe("countries");
    expect(Customer.fields.countryId.lookup?.label).toBe("name");
  });

  it("requires exactly one primary field", () => {
    expect(() => entity("broken", { name: field.text() })).toThrow(/exactly one primary/);
    expect(() =>
      entity("broken", { a: field.uuid().primary(), b: field.uuid().primary() }),
    ).toThrow(/exactly one primary/);
  });

  it("identifies searchable fields", () => {
    expect(searchableFields(Customer)).toEqual(["name", "email"]);
  });

  it("infers row types from field definitions", () => {
    type Row = InferRow<typeof Customer>;
    expectTypeOf<Row["id"]>().toEqualTypeOf<string>();
    expectTypeOf<Row["name"]>().toEqualTypeOf<string>();
    expectTypeOf<Row["email"]>().toEqualTypeOf<string | null>();
    expectTypeOf<Row["active"]>().toEqualTypeOf<boolean | null>();
  });
});
