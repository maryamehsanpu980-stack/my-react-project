import { test, expect } from "@playwright/test";

test("homepage should render visible page content", async ({ page }) => {
  await page.goto("/");

  await page.waitForLoadState("domcontentloaded");

  await expect(page.locator("body")).toBeVisible();

  const visibleElementsCount = await page.locator("body *:visible").count();

  expect(visibleElementsCount).toBeGreaterThan(0);
});

test("homepage should not show frontend crash message", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByText(/application error|runtime error|failed to compile|something went wrong/i)
  ).not.toBeVisible();
});