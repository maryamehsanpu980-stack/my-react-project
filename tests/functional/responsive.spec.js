import { test, expect } from "@playwright/test";

test("homepage should be visible on mobile screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  await expect(page.locator("body")).toBeVisible();

  const pageContent = await page.locator("body").innerText();

  expect(pageContent).not.toMatch(/404|page not found/i);
});