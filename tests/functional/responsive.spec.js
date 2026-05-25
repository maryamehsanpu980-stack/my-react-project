import { test, expect } from "@playwright/test";

test("homepage should be visible on mobile screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/");

  await page.waitForLoadState("domcontentloaded");

  await expect(page.locator("body")).toBeVisible();

  const visibleElementsCount = await page.locator("body *:visible").count();

  expect(visibleElementsCount).toBeGreaterThan(0);
});

test("mobile homepage should not show 404 page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/");

  await expect(page.getByText(/404|page not found/i)).not.toBeVisible();
});