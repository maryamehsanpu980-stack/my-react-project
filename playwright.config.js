import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/functional",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3000",
     headless: !!process.env.CI,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
});