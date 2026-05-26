import { test, expect } from "@playwright/test";

test("upload page should open without 404", async ({ page }) => {
  await page.goto("/upload");

  await page.waitForLoadState("domcontentloaded");

  await expect(page.locator("body")).toBeVisible();

  await expect(page.getByText(/404|page not found/i)).not.toBeVisible();
});

test("upload page should not show frontend crash message", async ({ page }) => {
  await page.goto("/upload");

  await expect(
    page.getByText(/application error|runtime error|failed to compile|something went wrong/i)
  ).not.toBeVisible();
});