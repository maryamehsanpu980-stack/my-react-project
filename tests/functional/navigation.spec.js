import { test, expect } from "@playwright/test";

test("homepage should have navigation links", async ({ page }) => {
  await page.goto("/");

  const links = page.locator("a");

  await expect(links.first()).toBeVisible();

  const linkCount = await links.count();

  expect(linkCount).toBeGreaterThan(0);
});

test("main internal links should not open 404 page", async ({ page }) => {
  await page.goto("/");

  const hrefs = await page.locator("a").evaluateAll((links) =>
    links
      .map((link) => link.getAttribute("href"))
      .filter((href) => href && href.startsWith("/") && href !== "#")
  );

  const uniqueLinks = [...new Set(hrefs)].slice(0, 5);

  for (const href of uniqueLinks) {
    await page.goto(href);

    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByText(/404|page not found/i)).not.toBeVisible();
  }
});