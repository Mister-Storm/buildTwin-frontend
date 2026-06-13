import { describe, expect, it } from "vitest";
import { projectFlightsToTimeline } from "@/features/domain/mappers/flight.mapper";
import type { ProjectFlightListItemDto } from "@/types/api/flight.api";

const projectId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const flights: ProjectFlightListItemDto[] = [
  {
    flightId: "flight-old",
    flightDate: "2026-04-01",
    operatorName: "John Smith",
    imageCount: 35,
    latestProcessingStatus: "COMPLETED",
    latestJobId: "job-old",
  },
  {
    flightId: "flight-latest",
    flightDate: "2026-06-12",
    operatorName: "Jane Doe",
    imageCount: 42,
    latestProcessingStatus: "COMPLETED",
    latestJobId: "job-latest",
  },
];

describe("projectFlightsToTimeline", () => {
  it("sorts flights by date descending", () => {
    const entries = projectFlightsToTimeline(flights, new Set());

    expect(entries[0]?.id).toBe("flight-latest");
    expect(entries[1]?.id).toBe("flight-old");
  });

  it("marks the newest flight as latest", () => {
    const entries = projectFlightsToTimeline(flights, new Set());

    expect(entries[0]?.isLatest).toBe(true);
    expect(entries[1]?.isLatest).toBe(false);
  });

  it("sets hasOrthomosaic when flight id is in the set", () => {
    const entries = projectFlightsToTimeline(
      flights,
      new Set(["flight-latest"]),
    );

    expect(entries[0]?.hasOrthomosaic).toBe(true);
    expect(entries[1]?.hasOrthomosaic).toBe(false);
  });

  it("maps operator name and processing status from API", () => {
    const entries = projectFlightsToTimeline(flights, new Set());

    expect(entries[0]?.operatorName).toBe("Jane Doe");
    expect(entries[0]?.processingStatus).toBe("Concluído");
    expect(entries[0]?.latestJobId).toBe("job-latest");
  });
});
