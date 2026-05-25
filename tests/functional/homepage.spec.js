import { test, expect } from "@playwright/test";

test("homepage should open successfully", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("body")).toBeVisible();
});

test("homepage should not show 404 page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText(/404|page not found/i)).not.toBeVisible();
});