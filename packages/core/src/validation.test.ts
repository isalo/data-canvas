import { describe, expect, it } from "vitest";
import { entity } from "./entity";
import { field } from "./fields";

const Country = entity("countries", {
  id: field.uuid().primary(),
  name: field.text().required(),
});

const Customer = entity("customers", {
  id: field.uuid().primary(),
  name: field.text().required(),
  email: field.email(),
  age: field.number(),
  active: field.boolean(),
  signedUp: field.date(),
  countryId: field.lookup(Country, { label: "name" }),
});

describe("insertSchema", () => {
  it("accepts a valid record without a primary key", () => {
    const result = Customer.insertSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      countryId: "00000000-0000-4000-8000-000000000001",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = Customer.insertSchema.safeParse({ email: "ada@example.com" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["name"]);
    }
  });

  it("rejects invalid emails", () => {
    const result = Customer.insertSchema.safeParse({ name: "Ada", email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("normalizes empty strings on optional fields to null", () => {
    const result = Customer.insertSchema.safeParse({ name: "Ada", email: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBeNull();
    }
  });

  it("coerces numeric strings on number fields", () => {
    const result = Customer.insertSchema.safeParse({ name: "Ada", age: "36" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.age).toBe(36);
    }
  });

  it("validates date format", () => {
    expect(Customer.insertSchema.safeParse({ name: "Ada", signedUp: "2026-01-15" }).success).toBe(
      true,
    );
    expect(Customer.insertSchema.safeParse({ name: "Ada", signedUp: "15/01/2026" }).success).toBe(
      false,
    );
  });

  it("validates lookup values as uuids", () => {
    expect(Customer.insertSchema.safeParse({ name: "Ada", countryId: "nope" }).success).toBe(false);
  });

  it("strips unknown keys", () => {
    const result = Customer.insertSchema.safeParse({ name: "Ada", evil: "payload" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("evil" in result.data).toBe(false);
    }
  });
});

describe("updateSchema", () => {
  it("accepts partial updates", () => {
    const result = Customer.updateSchema.safeParse({ name: "Ada King" });
    expect(result.success).toBe(true);
  });

  it("does not allow nulling out required fields", () => {
    const result = Customer.updateSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("ignores the primary key", () => {
    const result = Customer.updateSchema.safeParse({ id: "whatever", name: "Ada" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("id" in result.data).toBe(false);
    }
  });
});
