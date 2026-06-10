import { entity, field } from "@datacanvas/core";

export const Country = entity("countries", {
  id: field.uuid().primary(),
  name: field.text().required(),
  code: field.text().required().label("ISO Code"),
});

export const Customer = entity("customers", {
  id: field.uuid().primary(),
  name: field.text().required(),
  email: field.email().required(),
  active: field.boolean(),
  countryId: field.lookup(Country, { label: "name" }),
});

export const Order = entity("orders", {
  id: field.uuid().primary(),
  reference: field.text().required(),
  customerId: field.lookup(Customer, { label: "name" }).required(),
  orderDate: field.date().required(),
  total: field.number().required(),
});

export const OrderItem = entity(
  "order_items",
  {
    id: field.uuid().primary(),
    orderId: field.lookup(Order, { label: "reference" }).required(),
    product: field.text().required(),
    quantity: field.number().required(),
    unitPrice: field.number().required(),
  },
  { title: "Order Items" },
);

export const allEntities = [Country, Customer, Order, OrderItem];
