import { defineConfig, devices } from "@playwright/test";
import { resolveRealBrowserEnvironment } from "./e2e/real/environment";

const environment = resolveRealBrowserEnvironment(process.env);

export default defineConfig({
  testDir: "./e2e/real",
  testIgnore: "**/*.test.ts",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: environment.baseURL,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [{ name: "chromium-real", use: devices["Desktop Chrome"] }],
});
