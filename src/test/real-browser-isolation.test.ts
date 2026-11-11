import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("should exclude real journeys when the demo browser suite is selected", () => {
  const sut = readFileSync("playwright.config.ts", "utf8");
  expect(sut).toContain('testIgnore: "**/real/**"');
});
