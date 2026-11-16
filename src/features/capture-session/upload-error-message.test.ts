import { describe, expect, it } from "vitest";
import { ApiError } from "@/types/api/common.api";
import {
  formatCaptureUploadError,
  shouldPreserveUploadSession,
} from "@/features/capture-session/upload-error-message";

describe("formatCaptureUploadError", () => {
  const sut = formatCaptureUploadError;

  it("should include support reference when validation rejects content", () => {
    const error = new ApiError(
      400,
      "VALIDATION_ERROR",
      "Image content is not a valid JPEG or PNG",
      "t079-validation",
    );

    expect(sut(error)).toContain("Image content is not a valid JPEG or PNG");
    expect(sut(error)).toContain("t079-validation");
  });

  it("should name conflict without losing the support reference", () => {
    const error = new ApiError(409, "CONFLICT", "Duplicate image", "t079-conflict");

    expect(sut(error)).toContain("duplicada");
    expect(sut(error)).toContain("t079-conflict");
  });

  it("should keep forbidden role distinct from session expiry", () => {
    const forbidden = new ApiError(403, "FORBIDDEN", "Access is denied", "t079-forbidden");
    const expired = new ApiError(401, "UNAUTHORIZED", "Session revoked", "t079-expired");

    expect(sut(forbidden)).toContain("permissão");
    expect(sut(expired)).toContain("Sessão inválida");
    expect(shouldPreserveUploadSession(forbidden)).toBe(true);
    expect(shouldPreserveUploadSession(expired)).toBe(false);
  });

  it("should surface sanitized internal failures with support reference", () => {
    const error = new ApiError(
      500,
      "INTERNAL_ERROR",
      "An unexpected error occurred",
      "t079-internal",
    );

    expect(sut(error)).toContain("inesperada");
    expect(sut(error)).toContain("t079-internal");
    expect(sut(error)).not.toContain("127.0.0.1");
  });
});
