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

  await page.goto(page.url().replace("/risk-report", ""));
  const poEditForm = page.locator('[data-testid="material-edit-form"][data-material-title="Vietnam buyer PO"]');
  await poEditForm.getByTestId("material-content-editor").fill(`Buyer: VietHome Trading Co., Ltd.
Seller: Shenzhen Bright Export Ltd.
Destination Country: Vietnam
Product: LED lamps
Quantity: 1000 pcs
Amount: USD 48,000
Incoterm: FOB Shenzhen
Payment terms: 30% deposit, 70% balance paid before shipment. Seller may suspend shipment for overdue payment.
Delivery date: 2026-07-30
Inspection: buyer inspection within 7 days after arrival.
Dispute resolution: arbitration in Singapore, proceedings shall be English.`);
  await poEditForm.getByRole("button", { name: "保存材料修改" }).click();
  await page.getByRole("button", { name: "风险扫描" }).click();
  await expect(page.locator(".risk-card").filter({ hasText: "R-PAY-001" })).toHaveCount(0);
});
