import { describe, expect, it } from "vitest";
import { projectCaptureSessionsToTimeline } from "@/features/domain/mappers/capture-session.mapper";
import type { ProjectCaptureSessionListItemDto } from "@/types/api/capture-session.api";

const captureSessions: ProjectCaptureSessionListItemDto[] = [
  {
    captureSessionId: "flight-old",
    captureDate: "2026-04-01",
    operatorName: "John Smith",
    imageCount: 35,
    latestProcessingStatus: "COMPLETED",
    latestJobId: "job-old",
  },
  {
    captureSessionId: "flight-latest",
    captureDate: "2026-06-12",
    operatorName: "Jane Doe",
    imageCount: 42,
    latestProcessingStatus: "COMPLETED",
    latestJobId: "job-latest",
  },
];

describe("projectCaptureSessionsToTimeline", () => {
  it("sorts captureSessions by date descending", () => {
    const entries = projectCaptureSessionsToTimeline(captureSessions, new Set());

    expect(entries[0]?.id).toBe("flight-latest");
    expect(entries[1]?.id).toBe("flight-old");
  });

  it("marks the newest flight as latest", () => {
    const entries = projectCaptureSessionsToTimeline(captureSessions, new Set());

    expect(entries[0]?.isLatest).toBe(true);
    expect(entries[1]?.isLatest).toBe(false);
  });

  it("sets hasOrthomosaic when flight id is in the set", () => {
    const entries = projectCaptureSessionsToTimeline(
      captureSessions,
      new Set(["flight-latest"]),
    );

    expect(entries[0]?.hasOrthomosaic).toBe(true);
    expect(entries[1]?.hasOrthomosaic).toBe(false);
  });

  it("maps operator name and processing status from API", () => {
    const entries = projectCaptureSessionsToTimeline(captureSessions, new Set());

    expect(entries[0]?.operatorName).toBe("Jane Doe");
    expect(entries[0]?.processingStatus).toBe("Concluído");
    expect(entries[0]?.latestJobId).toBe("job-latest");
  });
});
