import { afterEach, describe, expect, it, vi } from "vitest";
import { startProcessing } from "@/services/processing.service";
import { apiFetch } from "@/services/api-client";

vi.mock("@/services/api-client", () => ({
  apiFetch: vi.fn(),
}));

describe("processing.service", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("startProcessing posts to captureSessions process endpoint", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      jobId: "job-1",
      captureSessionId: "f1",
      status: "PENDING",
    });

    await startProcessing("flight-1");

    expect(apiFetch).toHaveBeenCalledWith(
      "/capture-sessions/flight-1/process",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
