import { test, expect } from "@playwright/test";

test("contributors API route should be reachable", async ({ request }) => {
  const response = await request.get("/api/contributors");

  expect(response.status()).not.toBe(404);
});

test("reports API route should be reachable", async ({ request }) => {
  const response = await request.get("/api/reports");

  expect(response.status()).not.toBe(404);
});

test("invalid report id API route should be reachable", async ({ request }) => {
  const response = await request.get("/api/reports/invalid-test-id");

  expect(response.status()).not.toBe(404);
});

test("upload API should reject empty upload request", async ({ request }) => {
  const response = await request.post("/api/upload", {
    multipart: {},
  });

  expect(response.status()).not.toBe(404);
  expect(response.status()).not.toBe(200);
});

test("reports API should respond within acceptable time", async ({ request }) => {
  const startTime = Date.now();

  const response = await request.get("/api/reports");

  const duration = Date.now() - startTime;

  expect(response.status()).not.toBe(404);
  expect(duration).toBeLessThan(10000);
});