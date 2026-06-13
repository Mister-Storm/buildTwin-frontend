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

  it("startProcessing posts to flights process endpoint", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      jobId: "job-1",
      flightId: "f1",
      status: "PENDING",
    });

    await startProcessing("flight-1");

    expect(apiFetch).toHaveBeenCalledWith(
      "/flights/flight-1/process",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
