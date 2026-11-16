import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  listCaptureSessionImages,
  uploadCaptureSessionImages,
} from "@/services/capture-sessions.service";
import { apiFetch } from "@/services/api-client";
import wire from "@/services/__fixtures__/input-error-wire.json";
import { ApiError } from "@/types/api/common.api";

const INPUT_ERROR_WIRE_SHA256 =
  "1de7ffd35f26c17e2b46d6571d9f7a7fc95e6d0d3312916e85eb3f6f7f010b45";

const SESSION_ID = "00000000-0000-4000-8000-000000000004";

type Served = { status: number; body?: unknown; lost?: boolean };

function serveUpload(served: Served): FormData[] {
  const sent: FormData[] = [];
  class WireXmlHttpRequest {
    status = 0;
    statusText = "";
    responseText = "";
    upload: { onprogress: ((event: ProgressEvent) => void) | null } = {
      onprogress: null,
    };
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    open() {}
    setRequestHeader() {}
    send(body: FormData) {
      sent.push(body);
      if (served.lost) {
        this.onerror?.();
        return;
      }
      this.status = served.status;
      this.responseText = JSON.stringify(served.body);
      this.onload?.();
    }
  }
  vi.stubGlobal("XMLHttpRequest", WireXmlHttpRequest);
  return sent;
}

function serveFetch(body: unknown, status: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
}

function capture(): File {
  return new File([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], "wire.jpg", {
    type: "image/jpeg",
  });
}

async function rejectionOf(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
  throw new Error("Request unexpectedly succeeded");
}

describe("K-D2 serialized backend multipart and error contract", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should pin the shared input error wire when frontend and backend copies are compared", () => {
    const bytes = readFileSync(
      resolve(__dirname, "__fixtures__/input-error-wire.json"),
    );
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(
      INPUT_ERROR_WIRE_SHA256,
    );
  });

  it("should return every accepted image field when the actual created wire is consumed", async () => {
    const sut = uploadCaptureSessionImages;
    const sent = serveUpload({
      status: wire.uploadAccepted.actualStatus,
      body: wire.uploadAccepted.body,
    });

    const accepted = await sut(SESSION_ID, [capture()]);

    expect(accepted).toEqual(wire.uploadAccepted.body);
    expect(sent).toHaveLength(1);
  });

  it("should keep checksum length and optional gps when the actual listing wire is consumed", async () => {
    const sut = listCaptureSessionImages;
    serveFetch(wire.listing.body, wire.listing.actualStatus);

    const images = await sut(SESSION_ID);

    expect(images).toEqual(wire.listing.body);
    expect(images[0]).toMatchObject({
      checksum:
        "ba07a8bd542495fbbb1cc1ad561c5b9b98ae7a743cefb6ed5e434ff22e352f43",
      fileSize: 925,
      metadata: { latitude: -23.55, longitude: -46.63 },
    });
  });

  it.each([
    ["disguisedJpeg", 400, "VALIDATION_ERROR"],
    ["missingFilesPart", 400, "VALIDATION_ERROR"],
    ["unsupportedMedia", 415, "UNSUPPORTED_MEDIA_TYPE"],
    ["unsupportedMethod", 405, "METHOD_NOT_ALLOWED"],
    ["unauthenticated", 401, "UNAUTHORIZED"],
    ["viewerUpload", 403, "FORBIDDEN"],
    ["foreignSession", 404, "NOT_FOUND"],
    ["missingSession", 404, "NOT_FOUND"],
    ["duplicate", 409, "CONFLICT"],
    ["internalError", 500, "INTERNAL_ERROR"],
    ["staleAccess", 401, "UNAUTHORIZED"],
    ["revokedUpload", 401, "UNAUTHORIZED"],
  ] as const)(
    "should reject with the served status and code when the actual %s wire is consumed",
    async (name, status, code) => {
      const sut = uploadCaptureSessionImages;
      const caseWire = wire[name];
      serveUpload({ status: caseWire.actualStatus, body: caseWire.body });

      const error = await rejectionOf(sut(SESSION_ID, [capture()]));

      expect(error.status).toBe(status);
      expect(error.code).toBe(code);
      expect(error.traceId).toBe(caseWire.body.traceId);
      expect(error.message).toBe(caseWire.body.message);
    },
  );

  it("should keep foreign and missing session messages isomorphic when session ids are normalized", () => {
    const requested = "requested-session";
    const foreign = wire.foreignSession.body.message.replace(
      "00000000-0000-4000-8000-000000000007",
      requested,
    );
    const missing = wire.missingSession.body.message.replace(
      "00000000-0000-4000-8000-000000000008",
      requested,
    );

    expect(foreign).toBe(missing);
  });

  it("should not surface storage internals when the actual internal error wire is consumed", async () => {
    const sut = uploadCaptureSessionImages;
    serveUpload({
      status: wire.internalError.actualStatus,
      body: wire.internalError.body,
    });

    const error = await rejectionOf(sut(SESSION_ID, [capture()]));

    expect(error.status).toBe(500);
    expect(error.message).not.toContain("10.20.30.40");
    expect(error.message).not.toContain("minio-s3cr3t-key");
    expect(error.message).not.toContain("MinIO");
    expect(error.traceId).toBe(wire.internalError.body.traceId);
  });

  it("should keep role forbidden distinct from session expiry when the refreshed governance wire is consumed", async () => {
    const sut = apiFetch;
    serveFetch(
      wire.refreshedRoleForbidden.body,
      wire.refreshedRoleForbidden.actualStatus,
    );

    const error = await rejectionOf(sut("/admin/users"));

    expect(error.status).toBe(403);
    expect(error.code).toBe("FORBIDDEN");
    expect(error.traceId).toBe(wire.refreshedRoleForbidden.body.traceId);
  });

  it("should keep resource forbidden without treating it as expiry when the refreshed write wire is consumed", async () => {
    const sut = apiFetch;
    serveFetch(
      wire.refreshedForbiddenWrite.body,
      wire.refreshedForbiddenWrite.actualStatus,
    );

    const error = await rejectionOf(
      sut("/projects/00000000-0000-4000-8000-000000000003/capture-sessions", {
        method: "POST",
        body: "{}",
      }),
    );

    expect(error.status).toBe(403);
    expect(error.code).toBe("FORBIDDEN");
    expect(error.traceId).toBe(wire.refreshedForbiddenWrite.body.traceId);
  });

  it("should serve permitted listing when the refreshed permitted listing wire is consumed", async () => {
    const sut = listCaptureSessionImages;
    serveFetch(
      wire.refreshedPermittedListing.body,
      wire.refreshedPermittedListing.actualStatus,
    );

    const images = await sut("00000000-0000-4000-8000-000000000009");

    expect(images).toEqual(wire.refreshedPermittedListing.body);
  });
});
