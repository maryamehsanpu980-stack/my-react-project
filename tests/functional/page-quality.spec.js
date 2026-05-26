import { test, expect } from "@playwright/test";

test("homepage should render visible page content", async ({ page }) => {
  await page.goto("/", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  await expect(page.locator("body")).toBeVisible();

  const bodyText = await page.locator("body").innerText();

  expect(bodyText).not.toMatch(
    /404|page not found|application error|runtime error|failed to compile|module not found|build error/i
  );
});