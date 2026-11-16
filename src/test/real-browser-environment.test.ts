import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveRealBrowserEnvironment } from "../../e2e/real/environment";

const environment = {
  BUILDTWIN_DEMO_MODE: "false",
  NEXT_PUBLIC_BUILDTWIN_DEMO_MODE: "false",
  BUILDTWIN_REAL_BASE_URL: "http://localhost:3000",
  BUILDTWIN_API_URL: "http://localhost:8080",
};
const sut = resolveRealBrowserEnvironment;

describe("real-service browser environment", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("should keep real configuration isolated when browser tests are discovered", async () => {
    for (const [name, value] of Object.entries(environment)) vi.stubEnv(name, value);
    const sut = (await import("../../playwright.real.config")).default;
    expect(sut.webServer).toBeUndefined();
    expect(sut.testDir).toBe("./e2e/real");
    expect(sut.use?.trace).toBe("off");
    expect(sut.use?.video).toBe("off");
    expect(sut.use?.screenshot).toBe("off");
  });
  it("should require explicit service URLs when demo is disabled", () => {
    expect(sut(environment)).toEqual({ baseURL: "http://localhost:3000", apiURL: "http://localhost:8080" });
    expect(() => sut({ ...environment, BUILDTWIN_API_URL: undefined })).toThrow("BUILDTWIN_API_URL");
  });

  it("should reject demo fallback when either flag is enabled or omitted", () => {
    expect(() => sut({ ...environment, BUILDTWIN_DEMO_MODE: "true" })).toThrow("both demo flags");
    expect(() => sut({ ...environment, NEXT_PUBLIC_BUILDTWIN_DEMO_MODE: "true" })).toThrow("both demo flags");
    expect(() => sut({ ...environment, BUILDTWIN_DEMO_MODE: undefined })).toThrow("both demo flags");
  });

  it("should reject credential-bearing URLs when configuring real services", () => {
    expect(() => sut({ ...environment, BUILDTWIN_API_URL: "http://user:password@localhost:8080" })).toThrow("without credentials");
    expect(() => sut({ ...environment, BUILDTWIN_API_URL: "file:///tmp/mock-api" })).toThrow("HTTP service URL");
  });
});
