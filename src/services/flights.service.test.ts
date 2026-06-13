import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getFlight,
  getLatestFlightJob,
  listFlightsByProject,
} from "@/services/flights.service";
import { apiFetch } from "@/services/api-client";

vi.mock("@/services/api-client", () => ({
  apiFetch: vi.fn(),
}));

describe("flights.service", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("listFlightsByProject calls API path", async () => {
    vi.mocked(apiFetch).mockResolvedValue([]);

    await listFlightsByProject("proj-1");

    expect(apiFetch).toHaveBeenCalledWith("/projects/proj-1/flights");
  });

  it("getLatestFlightJob calls API path", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ jobId: "job-1" });

    await getLatestFlightJob("flight-1");

    expect(apiFetch).toHaveBeenCalledWith("/flights/flight-1/latest-job");
  });

  it("getFlight calls API path", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ flightId: "flight-1" });

    await getFlight("flight-1");

    expect(apiFetch).toHaveBeenCalledWith("/flights/flight-1");
  });
});
