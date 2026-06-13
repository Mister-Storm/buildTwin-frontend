import { describe, expect, it } from "vitest";
import { mergeFlightsWithDashboard } from "@/features/domain/mappers/flight.mapper";
import type { DashboardFlightSummaryDto } from "@/types/api/dashboard.api";
import type { FlightResponseDto } from "@/types/api/flight.api";

const projectId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const flights: FlightResponseDto[] = [
  {
    id: "flight-old",
    projectId,
    flightDate: "2026-04-01",
    operatorName: "John Smith",
    status: "COMPLETED",
    imageCount: 35,
  },
  {
    id: "flight-latest",
    projectId,
    flightDate: "2026-06-12",
    operatorName: "Jane Doe",
    status: "COMPLETED",
    imageCount: 42,
  },
];

const dashboardFlights: DashboardFlightSummaryDto[] = [
  {
    id: "flight-old",
    flightDate: "2026-04-01",
    status: "COMPLETED",
    imageCount: 35,
    latestJobStatus: "COMPLETED",
    hasReport: false,
  },
  {
    id: "flight-latest",
    flightDate: "2026-06-12",
    status: "COMPLETED",
    imageCount: 42,
    latestJobStatus: "COMPLETED",
    hasReport: true,
  },
];

describe("mergeFlightsWithDashboard", () => {
  it("sorts flights by date descending", () => {
    const entries = mergeFlightsWithDashboard(
      flights,
      dashboardFlights,
      new Set(),
    );

    expect(entries[0]?.id).toBe("flight-latest");
    expect(entries[1]?.id).toBe("flight-old");
  });

  it("marks the newest flight as latest", () => {
    const entries = mergeFlightsWithDashboard(
      flights,
      dashboardFlights,
      new Set(),
    );

    expect(entries[0]?.isLatest).toBe(true);
    expect(entries[1]?.isLatest).toBe(false);
  });

  it("sets hasOrthomosaic when flight id is in the set", () => {
    const entries = mergeFlightsWithDashboard(
      flights,
      dashboardFlights,
      new Set(["flight-latest"]),
    );

    expect(entries[0]?.hasOrthomosaic).toBe(true);
    expect(entries[1]?.hasOrthomosaic).toBe(false);
  });
});
