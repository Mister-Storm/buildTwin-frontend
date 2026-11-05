import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch, artifactDownloadUrl, artifactPreviewUrl } from "@/services/api-client";
import * as auth from "@/services/auth.service";
import { ApiError } from "@/types/api/common.api";

describe("artifactPreviewUrl", () => {
  it("builds preview path for artifact id", () => {
    expect(artifactPreviewUrl("abc-123")).toBe(
      "/preview/artifacts/abc-123",
    );
  });
});

describe("artifactDownloadUrl", () => {
  it("builds download path for artifact id", () => {
    expect(artifactDownloadUrl("abc-123")).toBe(
      "/api/v1/artifacts/abc-123/download",
    );
  });
});

describe("apiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns parsed JSON on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: "1", name: "Test" }),
      }),
    );

    const result = await apiFetch<{ id: string; name: string }>("/projects");

    expect(result).toEqual({ id: "1", name: "Test" });
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/projects",
      expect.objectContaining({
        headers: expect.objectContaining({ Accept: "application/json" }),
        cache: "no-store",
      }),
    );
  });

  it("throws ApiError on 404 with message and code", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({
          error: "NOT_FOUND",
          message: "Project not found",
        }),
      }),
    );

    await expect(apiFetch("/projects/missing")).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      code: "NOT_FOUND",
      message: "Project not found",
    } satisfies Partial<ApiError>);
  });
});


describe("T-A03 refreshed session preservation", () => {
  afterEach(() => {
    localStorage.clear();
    document.cookie = "buildtwin_token=; path=/; max-age=0";
    document.cookie = "buildtwin_auth=; path=/; max-age=0";
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function session() {
    localStorage.setItem("buildtwin_token", "old-access");
    localStorage.setItem("buildtwin_refresh", "current-refresh");
    return {
      token: "new-access",
      refreshToken: "new-refresh",
      user: { id: "viewer", email: "viewer@example.invalid", displayName: "Viewer", roles: ["PROJECT_VIEWER"] },
    };
  }

  it("should retain refreshed session and next permitted action when retry is forbidden", async () => {
    const refreshed = session();
    const logout = vi.spyOn(auth, "logout").mockImplementation(() => { localStorage.clear(); });
    const transport = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(refreshed)))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "FORBIDDEN", message: "Viewer cannot edit" }), { status: 403 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "allowed-project" })));
    vi.stubGlobal("fetch", transport);
    const sut = apiFetch;

    await expect(sut("/projects/restricted")).rejects.toMatchObject({ status: 403, code: "FORBIDDEN" });
    expect(logout).not.toHaveBeenCalled();
    expect(localStorage.getItem("buildtwin_token")).toBe("new-access");
    expect(document.cookie).toContain("buildtwin_token=new-access");
    await expect(sut("/projects/allowed")).resolves.toEqual({ id: "allowed-project" });
    expect(transport.mock.calls[3]?.[1].headers.Authorization).toBe("Bearer new-access");
  });

  it("should preserve permitted retry when current credentials refresh", async () => {
    const refreshed = session();
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(refreshed)))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "allowed-project" }))));
    const sut = apiFetch;

    await expect(sut("/projects/allowed")).resolves.toEqual({ id: "allowed-project" });
    expect(localStorage.getItem("buildtwin_token")).toBe("new-access");
  });

  it("should log out when refresh is rejected", async () => {
    session();
    const logout = vi.spyOn(auth, "logout").mockImplementation(() => { localStorage.clear(); });
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 })));
    const sut = apiFetch;

    await expect(sut("/projects/allowed")).rejects.toMatchObject({ status: 401, code: "SESSION_EXPIRED" });
    expect(logout).toHaveBeenCalled();
    expect(localStorage.getItem("buildtwin_token")).toBeNull();
  });

  it("should avoid automatic replay when mutation has no idempotency contract", async () => {
    const refreshed = session();
    const transport = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(refreshed)))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "next-permitted" })));
    vi.stubGlobal("fetch", transport);
    const sut = apiFetch;

    await expect(sut("/projects", { method: "POST", body: JSON.stringify({ name: "New" }) })).rejects.toMatchObject({ status: 401, code: "REQUEST_RETRY_REQUIRED" });
    expect(localStorage.getItem("buildtwin_token")).toBe("new-access");
    expect(transport.mock.calls.filter(([url]) => url === "/api/v1/projects")).toHaveLength(1);
    await expect(sut("/projects/allowed")).resolves.toEqual({ id: "next-permitted" });
  });

  it("should preserve session when ordinary permission denial needs no refresh", async () => {
    session();
    const logout = vi.spyOn(auth, "logout").mockImplementation(() => { localStorage.clear(); });
    const transport = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "FORBIDDEN", message: "Forbidden" }), { status: 403 }));
    vi.stubGlobal("fetch", transport);
    const sut = apiFetch;

    await expect(sut("/projects/restricted")).rejects.toMatchObject({ status: 403, code: "FORBIDDEN" });
    expect(transport).toHaveBeenCalledTimes(1);
    expect(logout).not.toHaveBeenCalled();
    expect(localStorage.getItem("buildtwin_token")).toBe("old-access");
  });

  it("should log out when refreshed access remains unauthorized", async () => {
    const refreshed = session();
    const logout = vi.spyOn(auth, "logout").mockImplementation(() => { localStorage.clear(); });
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(refreshed)))
      .mockResolvedValueOnce(new Response(null, { status: 401 })));
    const sut = apiFetch;

    await expect(sut("/projects/allowed")).rejects.toMatchObject({ status: 401, code: "SESSION_EXPIRED" });
    expect(logout).toHaveBeenCalled();
    expect(localStorage.getItem("buildtwin_token")).toBeNull();
  });

  it("should preserve renewed session when retry has a server error", async () => {
    const refreshed = session();
    const logout = vi.spyOn(auth, "logout").mockImplementation(() => { localStorage.clear(); });
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(refreshed)))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "INTERNAL_ERROR", message: "Request failed" }), { status: 500 })));
    const sut = apiFetch;

    await expect(sut("/projects/allowed")).rejects.toMatchObject({ status: 500, code: "INTERNAL_ERROR" });
    expect(logout).not.toHaveBeenCalled();
    expect(localStorage.getItem("buildtwin_token")).toBe("new-access");
  });

});
