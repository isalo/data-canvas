import { expect, test } from "@playwright/test";

test("customers screen lists seeded data", async ({ page }) => {
  await page.goto("/customers");
  await expect(page.getByRole("heading", { name: "Customers" })).toBeVisible();
  await expect(page.getByText("Ada Lovelace")).toBeVisible();
  // Lookup column resolves the country id to its label.
  await expect(page.getByRole("cell", { name: "United Kingdom" }).first()).toBeVisible();
});

test("creates a customer through the generated form", async ({ page }) => {
  await page.goto("/customers");
  await page.getByRole("button", { name: "New" }).click();

  await page.getByLabel(/^Name/).fill("Test User");
  await page.getByLabel(/^Email/).fill("test@example.com");
  await page.getByLabel(/^Country/).selectOption({ label: "Japan" });
  await page.getByRole("button", { name: "Create" }).click();

  await expect(page.getByText("test@example.com")).toBeVisible();
});

test("validates input before submitting", async ({ page }) => {
  await page.goto("/customers");
  await page.getByRole("button", { name: "New" }).click();
  await page.getByLabel(/^Email/).fill("not-an-email");
  await page.getByRole("button", { name: "Create" }).click();

  await expect(page.getByText("Required")).toBeVisible();
  await expect(page.getByText("Invalid email address")).toBeVisible();
});

test("orders master/detail shows items for the selected order", async ({ page }) => {
  await page.goto("/orders");
  await expect(page.getByText("Select an order above")).toBeVisible();

  await page.getByRole("cell", { name: "ORD-1001" }).click();
  await expect(page.getByRole("heading", { name: "Items — ORD-1001" })).toBeVisible();
  await expect(page.getByText("Analytical Engine")).toBeVisible();

  await page.getByRole("cell", { name: "ORD-1002" }).click();
  await expect(page.getByText("Compiler Manual")).toBeVisible();
});
