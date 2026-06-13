import { describe, expect, it } from "vitest";
import {
  buildProcessingSteps,
  jobStatusFriendlyMessage,
} from "@/features/flight/job-status-utils";

describe("jobStatusFriendlyMessage", () => {
  it("maps PENDING to friendly text", () => {
    expect(jobStatusFriendlyMessage("PENDING")).toBe(
      "Aguardando processamento",
    );
  });

  it("maps RUNNING to friendly text", () => {
    expect(jobStatusFriendlyMessage("RUNNING")).toBe("Gerando ortomosaico");
  });
});

describe("buildProcessingSteps", () => {
  it("marks all steps complete when job COMPLETED", () => {
    const steps = buildProcessingSteps({
      imageCount: 5,
      jobStatus: "COMPLETED",
      createdAt: "2026-06-12T10:00:00Z",
      startedAt: "2026-06-12T10:01:00Z",
      completedAt: "2026-06-12T11:00:00Z",
    });
    expect(steps).toHaveLength(7);
    expect(steps.every((s) => s.completed)).toBe(true);
  });

  it("marks upload step when images exist", () => {
    const steps = buildProcessingSteps({
      imageCount: 3,
      jobStatus: null,
    });
    expect(steps[0]?.completed).toBe(true);
    expect(steps[6]?.completed).toBe(false);
  });
});
