import { type EntityRow } from "@data-canvas/core";

// Mirrors docker/init.sql so the in-memory fallback adapter shows the same
// data as a fresh PostgreSQL container.

const uuid = (suffix: string) => `00000000-0000-4000-8000-${suffix.padStart(12, "0")}`;

const countries = {
  us: uuid("1"),
  gb: uuid("2"),
  de: uuid("3"),
  fr: uuid("4"),
  jp: uuid("5"),
};

const customers = {
  ada: uuid("101"),
  grace: uuid("102"),
  alan: uuid("103"),
  konrad: uuid("104"),
};

const orders = {
  ord1: uuid("201"),
  ord2: uuid("202"),
  ord3: uuid("203"),
};

export const seed: Record<string, EntityRow[]> = {
  countries: [
    { id: countries.us, name: "United States", code: "US" },
    { id: countries.gb, name: "United Kingdom", code: "GB" },
    { id: countries.de, name: "Germany", code: "DE" },
    { id: countries.fr, name: "France", code: "FR" },
    { id: countries.jp, name: "Japan", code: "JP" },
  ],
  customers: [
    {
      id: customers.ada,
      name: "Ada Lovelace",
      email: "ada@example.com",
      active: true,
      countryId: countries.gb,
    },
    {
      id: customers.grace,
      name: "Grace Hopper",
      email: "grace@example.com",
      active: true,
      countryId: countries.us,
    },
    {
      id: customers.alan,
      name: "Alan Turing",
      email: "alan@example.com",
      active: false,
      countryId: countries.gb,
    },
    {
      id: customers.konrad,
      name: "Konrad Zuse",
      email: "konrad@example.com",
      active: true,
      countryId: countries.de,
    },
  ],
  orders: [
    {
      id: orders.ord1,
      reference: "ORD-1001",
      customerId: customers.ada,
      orderDate: "2026-01-15",
      total: 1250,
    },
    {
      id: orders.ord2,
      reference: "ORD-1002",
      customerId: customers.grace,
      orderDate: "2026-02-03",
      total: 480.5,
    },
    {
      id: orders.ord3,
      reference: "ORD-1003",
      customerId: customers.konrad,
      orderDate: "2026-03-21",
      total: 99.99,
    },
  ],
  order_items: [
    {
      id: uuid("301"),
      orderId: orders.ord1,
      product: "Analytical Engine",
      quantity: 1,
      unitPrice: 1000,
    },
    {
      id: uuid("302"),
      orderId: orders.ord1,
      product: "Punch Cards (box)",
      quantity: 5,
      unitPrice: 50,
    },
    {
      id: uuid("303"),
      orderId: orders.ord2,
      product: "Compiler Manual",
      quantity: 2,
      unitPrice: 40.25,
    },
    {
      id: uuid("304"),
      orderId: orders.ord2,
      product: "Debugging Kit",
      quantity: 1,
      unitPrice: 400,
    },
    {
      id: uuid("305"),
      orderId: orders.ord3,
      product: "Enigma Replica",
      quantity: 1,
      unitPrice: 99.99,
    },
  ],
};
