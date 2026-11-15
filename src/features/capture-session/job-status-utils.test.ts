import { describe, expect, it } from "vitest";
import {
  buildProcessingSteps,
  jobStatusFriendlyMessage,
} from "@/features/capture-session/job-status-utils";

describe("jobStatusFriendlyMessage", () => {
  it("maps PENDING to friendly text", () => {
    expect(jobStatusFriendlyMessage("PENDING")).toBe(
      "Aguardando processamento",
    );
  });

  it("maps RUNNING to friendly text", () => {
    expect(jobStatusFriendlyMessage("RUNNING")).toBe("Gerando ortomosaico");
  });

  it("should describe a capability restriction when the job was cancelled by policy", () => {
    expect(jobStatusFriendlyMessage("CANCELLED_RESTRICTED")).toBe(
      "Cancelado por restrição de capacidade",
    );
  });
});

describe("buildProcessingSteps with recorded engine profile", () => {
  it("should not mark full reconstruction as done when the engine stage fell back", () => {
    const sut = buildProcessingSteps;

    const steps = sut({
      imageCount: 3,
      jobStatus: "COMPLETED",
      engineProfile: "FALLBACK",
    });

    const engine = steps.find((step) => step.id === "nodeodm-running");
    expect(engine).toMatchObject({
      label: "Reconstrução completa indisponível (modo simplificado)",
      completed: false,
    });
  });

  it("should mark a restricted cancellation as a created job without completed processing", () => {
    const sut = buildProcessingSteps;

    const steps = sut({ imageCount: 3, jobStatus: "CANCELLED_RESTRICTED" });

    expect(steps.find((step) => step.id === "job-created")?.completed).toBe(true);
    expect(steps.find((step) => step.id === "completed")?.completed).toBe(false);
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
