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
    const steps = buildProcessingSteps(5, "COMPLETED");
    expect(steps.every((s) => s.completed)).toBe(true);
  });

  it("marks upload step when images exist", () => {
    const steps = buildProcessingSteps(3, null);
    expect(steps[0]?.completed).toBe(true);
    expect(steps[3]?.completed).toBe(false);
  });
});
