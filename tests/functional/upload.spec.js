import { test, expect } from "@playwright/test";

test("frontend should show main page content", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("body")).toBeVisible();

  const pageText = await page.locator("body").innerText();

  expect(pageText.length).toBeGreaterThan(0);
});