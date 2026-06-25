import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getCaptureSession,
  getLatestCaptureSessionJob,
  listCaptureSessionsByProject,
} from "@/services/capture-sessions.service";
import { apiFetch } from "@/services/api-client";

vi.mock("@/services/api-client", () => ({
  apiFetch: vi.fn(),
}));

describe("capture-sessions.service", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("listCaptureSessionsByProject calls API path", async () => {
    vi.mocked(apiFetch).mockResolvedValue([]);

    await listCaptureSessionsByProject("proj-1");

    expect(apiFetch).toHaveBeenCalledWith("/projects/proj-1/capture-sessions");
  });

  it("getLatestCaptureSessionJob calls API path", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ jobId: "job-1" });

    await getLatestCaptureSessionJob("flight-1");

    expect(apiFetch).toHaveBeenCalledWith("/capture-sessions/flight-1/latest-job");
  });

  it("getCaptureSession calls API path", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ captureSessionId: "flight-1" });

    await getCaptureSession("flight-1");

    expect(apiFetch).toHaveBeenCalledWith("/capture-sessions/flight-1");
  });
});
