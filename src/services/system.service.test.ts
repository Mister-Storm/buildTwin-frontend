import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSystemOverview, getSystemReadiness, runSystemSelfTest } from "@/services/system.service";

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("system.service", () => {
  it("should preserve scoped overview data when the authorized endpoint succeeds", async () => {
    const overview = {
      timestamp: "2026-11-05T12:00:00Z",
      overallStatus: "UP",
      components: {},
      operations: { projects: 1, captureSessions: 2, jobs: 1, processedJobs: 1, pendingJobs: 0, failedJobs: 0, recentJobs: [] },
    };
    localStorage.setItem("buildtwin_token", "scoped-session-fixture");
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(overview), { status: 200 }));
    const sut = await getSystemOverview();
    expect(sut).toEqual(overview);
    expect(fetch).toHaveBeenCalledWith("/api/v1/system/overview", expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer scoped-session-fixture" }),
      cache: "no-store",
    }));
  });

  it("should preserve minimal readiness when an anonymous caller checks public availability", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ status: "UP" }), { status: 200 }));
    const sut = await getSystemReadiness();
    expect(sut).toEqual({ status: "UP" });
    expect(fetch).toHaveBeenCalledWith("/api/v1/system/readiness", expect.objectContaining({
      headers: { Accept: "application/json" }, cache: "no-store",
    }));
  });

  it.each([403, 404, 500])("should retain status %s without fabricated overview data when scoped access fails", async (status) => {
    localStorage.setItem("buildtwin_token", "remaining-valid-session");
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ error: "SCOPED_ERROR", message: "Scoped request rejected" }), { status }));
    const sut = getSystemOverview();
    await expect(sut).rejects.toMatchObject({ status, code: "SCOPED_ERROR", message: "Scoped request rejected" });
    expect(localStorage.getItem("buildtwin_token")).toBe("remaining-valid-session");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should preserve forbidden action without retry when a current caller cannot run governance self-test", async () => {
    localStorage.setItem("buildtwin_token", "remaining-valid-session");
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ error: "FORBIDDEN", message: "Governance required" }), { status: 403 }));
    const sut = runSystemSelfTest();
    await expect(sut).rejects.toMatchObject({ status: 403, code: "FORBIDDEN" });
    expect(fetch).toHaveBeenCalledWith("/api/v1/system/self-test", expect.objectContaining({ method: "POST", cache: "no-store" }));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("buildtwin_token")).toBe("remaining-valid-session");
  });
});
