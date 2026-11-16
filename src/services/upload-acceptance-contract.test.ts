import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  listCaptureSessionImages,
  uploadCaptureSessionImages,
} from "@/services/capture-sessions.service";
import wire from "@/services/__fixtures__/upload-acceptance-wire.json";
import { ApiError } from "@/types/api/common.api";

const UPLOAD_WIRE_SHA256 =
  "615771afed9c7a7793e9f42d286d97942d5962092981c5a71d0bd81a1fe91907";

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
  throw new Error("Upload unexpectedly succeeded");
}

describe("K-D2 serialized backend upload acceptance contract", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should pin the shared upload wire when frontend and backend copies are compared", () => {
    const bytes = readFileSync(
      resolve(__dirname, "__fixtures__/upload-acceptance-wire.json"),
    );
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(
      UPLOAD_WIRE_SHA256,
    );
  });

  it("should return every accepted image field when the actual created wire is consumed", async () => {
    const sut = uploadCaptureSessionImages;
    const sent = serveUpload({
      status: wire.success.actualStatus,
      body: wire.success.body,
    });

    const accepted = await sut(SESSION_ID, [capture()]);

    expect(accepted).toEqual(wire.success.body);
    expect(sent).toHaveLength(1);
    expect(sent[0]?.getAll("files")).toHaveLength(1);
  });

  it("should keep checksum length and optional gps when the actual listing wire is consumed", async () => {
    const sut = listCaptureSessionImages;
    serveFetch(wire.listing.body, wire.listing.actualStatus);

    const images = await sut(SESSION_ID);

    expect(images).toEqual(wire.listing.body);
    expect(images[0]).toMatchObject({
      id: wire.success.body[0]?.imageId,
      checksum:
        "ba07a8bd542495fbbb1cc1ad561c5b9b98ae7a743cefb6ed5e434ff22e352f43",
      fileSize: 925,
      metadata: { latitude: -23.55, longitude: -46.63 },
    });
  });

  it.each([
    ["duplicate", 409, "CONFLICT"],
    ["viewer", 403, "FORBIDDEN"],
    ["missingSession", 404, "NOT_FOUND"],
    ["revoked", 401, "UNAUTHORIZED"],
    ["storageOutage", 500, "INTERNAL_ERROR"],
  ] as const)(
    "should reject with the served status and code when the actual %s wire is consumed",
    async (name, status, code) => {
      const sut = uploadCaptureSessionImages;
      const sent = serveUpload({
        status: wire[name].actualStatus,
        body: wire[name].body,
      });

      const error = await rejectionOf(sut(SESSION_ID, [capture()]));

      expect(error.status).toBe(status);
      expect(error.code).toBe(code);
      expect(sent).toHaveLength(1);
    },
  );

  it.each(["duplicate", "viewer", "missingSession", "storageOutage"] as const)(
    "should keep the support trace identifier when the actual %s wire is consumed",
    async (name) => {
      const sut = uploadCaptureSessionImages;
      serveUpload({ status: wire[name].actualStatus, body: wire[name].body });

      const error = await rejectionOf(sut(SESSION_ID, [capture()]));

      expect((error as ApiError & { traceId?: string | null }).traceId).toBe(
        wire[name].body.traceId,
      );
    },
  );

  it("should not surface storage internals when the actual storage outage wire is consumed", async () => {
    const sut = uploadCaptureSessionImages;
    serveUpload({
      status: wire.storageOutage.actualStatus,
      body: wire.storageOutage.body,
    });

    const error = await rejectionOf(sut(SESSION_ID, [capture()]));

    expect(error.status).toBe(500);
    expect(error.message).not.toContain("127.0.0.1");
    expect(error.message).toBe(wire.storageOutage.body.message);
    expect(error.message).toBe("An unexpected error occurred");
  });

  it("should not replay the upload and should resolve acceptance through listing when the response is lost", async () => {
    const sut = uploadCaptureSessionImages;
    const sent = serveUpload({ status: 0, lost: true });

    const error = await rejectionOf(sut(SESSION_ID, [capture()]));
    serveFetch(wire.listing.body, wire.listing.actualStatus);
    const listed = await listCaptureSessionImages(SESSION_ID);

    expect(error.status).toBe(0);
    expect(error.code).toBe("NETWORK_ERROR");
    expect(sent).toHaveLength(1);
    expect(listed.map((image) => [image.checksum, image.fileSize])).toEqual([
      [
        "ba07a8bd542495fbbb1cc1ad561c5b9b98ae7a743cefb6ed5e434ff22e352f43",
        925,
      ],
    ]);
  });

  it("should report a duplicate conflict without a new binding when the client resubmits after a lost response", async () => {
    const sut = uploadCaptureSessionImages;
    const sent = serveUpload({
      status: wire.duplicate.actualStatus,
      body: wire.duplicate.body,
    });

    const error = await rejectionOf(sut(SESSION_ID, [capture()]));

    expect(error.status).toBe(409);
    expect(error.message).toBe(wire.duplicate.body.message);
    expect(sent).toHaveLength(1);
  });
});
