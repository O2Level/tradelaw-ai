import { expect, test } from "@playwright/test";

test("Vietnam PO demo hits R-PAY-001 and persists review", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "导入越南 PO" }).click();

  await expect(page.getByRole("heading", { name: "Vietnam Buyer PO - Arrival Balance Risk" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Vietnam buyer PO" })).toBeVisible();
  const payRisk = page.locator(".risk-card").filter({ hasText: "R-PAY-001" }).first();
  await expect(payRisk).toBeVisible();
  await expect(payRisk).toContainText("70% balance paid after arrival and buyer inspection");

  await page.getByLabel("复核意见").first().fill("E2E 要求改为发货前付清尾款或凭提单副本付款。");
  await page.getByRole("button", { name: "保存复核意见" }).first().click();
  await expect(page.getByText("E2E 要求改为发货前付清尾款或凭提单副本付款。")).toBeVisible();

  await page.getByRole("link", { name: "风险报告" }).click();
  await expect(page.getByText("人工复核意见")).toBeVisible();
  await expect(page.getByText("E2E 要求改为发货前付清尾款或凭提单副本付款。")).toBeVisible();
});
