import { test, expect } from "@playwright/test";

test("health API route should return success", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);

  const data = await response.json();

  expect(data.ok).toBe(true);
  expect(data.message).toBe("API is working");
});