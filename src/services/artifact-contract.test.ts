import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/preview/artifacts/[artifactId]/route";

const artifactId = "8f6c2a51-3d0e-4c3b-9a55-2f1d7e0b9c41";
const previewBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0xff, 0xd9]);

function previewRequest(cookie?: string) {
  return new NextRequest(`http://localhost:3000/preview/artifacts/${artifactId}`, {
    headers: cookie ? { cookie: `buildtwin_token=${cookie}` } : {},
  });
}

function serveBackend(status: number, body: BodyInit | null, headers: Record<string, string>) {
  const backend = vi.fn().mockResolvedValue(new Response(body, { status, headers }));
  vi.stubGlobal("fetch", backend);
  return backend;
}

function forwardedHeaders(backend: ReturnType<typeof vi.fn>) {
  const [, init] = backend.mock.calls[0] as [string, { headers: Record<string, string> }];
  return init.headers;
}

describe("K-B2 preview proxy delivery contract", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should forward the session cookie as bearer credential when a protected preview is requested", async () => {
    const backend = serveBackend(200, previewBytes, { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store" });
    const sut = GET;

    await sut(previewRequest("fixture-access-marker"), { params: Promise.resolve({ artifactId }) });

    expect(backend).toHaveBeenCalledWith(
      expect.stringMatching(new RegExp(`/api/v1/artifacts/${artifactId}/preview$`)),
      expect.any(Object),
    );
    expect(forwardedHeaders(backend)).toEqual({ Authorization: "Bearer fixture-access-marker" });
  });

  it("should send no credential when the request carries no session cookie", async () => {
    const backend = serveBackend(401, JSON.stringify({ error: "UNAUTHORIZED" }), { "Content-Type": "application/json" });
    const sut = GET;

    const response = await sut(previewRequest(), { params: Promise.resolve({ artifactId }) });

    expect(forwardedHeaders(backend)).toEqual({});
    expect(response.status).toBe(401);
  });

  it("should return identical bytes and media type when the backend permits the preview", async () => {
    serveBackend(200, previewBytes, {
      "Content-Type": "image/jpeg",
      "Content-Length": String(previewBytes.byteLength),
      "Cache-Control": "private, no-store",
    });
    const sut = GET;

    const response = await sut(previewRequest("fixture-access-marker"), { params: Promise.resolve({ artifactId }) });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(response.headers.get("content-length")).toBe(String(previewBytes.byteLength));
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(previewBytes);
  });

  it("should keep the protected no-store policy when the backend requires authorization on each request", async () => {
    serveBackend(200, previewBytes, { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store" });
    const sut = GET;

    const response = await sut(previewRequest("fixture-access-marker"), { params: Promise.resolve({ artifactId }) });

    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("should apply the protected no-store policy when the backend omits a cache directive", async () => {
    serveBackend(200, previewBytes, { "Content-Type": "image/jpeg" });
    const sut = GET;

    const response = await sut(previewRequest("fixture-access-marker"), { params: Promise.resolve({ artifactId }) });

    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("should enforce the protected no-store policy when the backend sends a shareable cache directive", async () => {
    serveBackend(200, previewBytes, { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=3600" });
    const sut = GET;

    const response = await sut(previewRequest("fixture-access-marker"), { params: Promise.resolve({ artifactId }) });

    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("should preserve disposition and filename when the backend names the delivered preview", async () => {
    const disposition = 'inline; filename="session-preview.jpg"';
    serveBackend(200, previewBytes, {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, no-store",
      "Content-Disposition": disposition,
    });
    const sut = GET;

    const response = await sut(previewRequest("fixture-access-marker"), { params: Promise.resolve({ artifactId }) });

    expect(response.headers.get("content-disposition")).toBe(disposition);
  });

  it.each([403, 404])("should relay status %i without private metadata when the backend denies the preview", async (status) => {
    serveBackend(status, JSON.stringify({ error: "NOT_FOUND", companyId: "foreign-company", objectKey: "private/raw.tif" }), {
      "Content-Type": "application/json",
    });
    const sut = GET;

    const response = await sut(previewRequest("fixture-access-marker"), { params: Promise.resolve({ artifactId }) });
    const body = await response.text();

    expect(response.status).toBe(status);
    expect(body).not.toContain("foreign-company");
    expect(body).not.toContain("private/raw.tif");
  });
});
