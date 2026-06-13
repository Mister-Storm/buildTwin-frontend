import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch, artifactPreviewUrl } from "@/services/api-client";
import { ApiError } from "@/types/api/common.api";

describe("artifactPreviewUrl", () => {
  it("builds preview path for artifact id", () => {
    expect(artifactPreviewUrl("abc-123")).toBe(
      "/api/v1/artifacts/abc-123/preview",
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
