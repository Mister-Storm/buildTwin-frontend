import { describe, expect, it } from "vitest";
import {
  describeJobRecovery,
  describeJobStages,
} from "@/features/capture-session/job-recovery";
import wire from "@/services/__fixtures__/jobs-wire.json";
import type {
  LatestCaptureSessionJobResponseDto,
  ProcessingJobDetailResponseDto,
  RecoveryCauseDto,
} from "@/types/api/processing.api";

const recoverable =
  wire.recoverableInterrupted.body as unknown as ProcessingJobDetailResponseDto;
const completed =
  wire.standardCompleted.body as unknown as ProcessingJobDetailResponseDto;
const failed =
  wire.failedAfterEngine.body as unknown as ProcessingJobDetailResponseDto;

describe("describeJobRecovery", () => {
  it("should offer recovery without claiming engine failure when progress was unverified", () => {
    const sut = describeJobRecovery;

    const recovery = sut(recoverable);

    expect(recovery.canRecover).toBe(true);
    expect(recovery.causeLabel).toBe("Progresso não verificado");
    expect(recovery.causeDescription).toContain("não comprova falha");
  });

  it("should describe each supervision cause distinctly when the job is recoverable", () => {
    const sut = describeJobRecovery;
    const causes: RecoveryCauseDto[] = [
      "PROGRESS_UNVERIFIED",
      "CONTACT_LOST",
      "SUPERVISION_EXPIRED",
      "EXECUTION_DEADLINE_EXCEEDED",
    ];

    const labels = causes.map(
      (recoveryCause) => sut({ ...recoverable, recoveryCause }).causeLabel,
    );

    expect(new Set(labels).size).toBe(4);
  });

  it("should offer recovery with a generic label when a recoverable failure has no supervision cause", () => {
    const sut = describeJobRecovery;

    const recovery = sut({ ...recoverable, recoveryCause: null });

    expect(recovery.canRecover).toBe(true);
    expect(recovery.causeLabel).toBe("Falha recuperável");
  });

  it("should not offer recovery when the job completed", () => {
    expect(describeJobRecovery(completed).canRecover).toBe(false);
  });

  it("should not offer recovery when the failure is not recoverable", () => {
    expect(describeJobRecovery(failed).canRecover).toBe(false);
  });

  it("should not offer recovery when an older backend omits the recovery fields", () => {
    const legacy = {
      jobId: "job-1",
      captureSessionId: "session-1",
      jobType: "ORTHOMOSAIC_PROCESSING",
      status: "FAILED",
      createdAt: "2026-11-11T12:00:00Z",
      startedAt: null,
      completedAt: null,
      failureReason: "Processor call failed",
    } satisfies LatestCaptureSessionJobResponseDto;

    expect(describeJobRecovery(legacy).canRecover).toBe(false);
  });
});

describe("describeJobStages", () => {
  it("should list recorded stages with profile and image counts when stage evidence was recorded", () => {
    const sut = describeJobStages;

    const stages = sut(completed);

    expect(stages.recorded).toBe(true);
    expect(stages.items.map((item) => item.label)).toEqual([
      "Reconstrução fotogramétrica",
      "Pré-visualização",
      "Miniatura",
      "Relatório da sessão",
      "Finalização",
    ]);
    expect(stages.items[0]).toMatchObject({
      statusLabel: "Concluída",
      profileLabel: "STANDARD",
      imageCountsLabel: "77 de 77 imagens reconstruídas",
    });
  });

  it("should disclose unrecorded stages instead of implying success when stage evidence is missing", () => {
    const sut = describeJobStages;

    const stages = sut(failed);

    expect(stages.recorded).toBe(false);
    expect(stages.items).toEqual([]);
    expect(stages.notice).toBe(
      "As etapas deste processamento não foram registradas; não é possível confirmar quais etapas foram concluídas.",
    );
  });

  it("should label failed and skipped stages explicitly when they were recorded", () => {
    const sut = describeJobStages;
    const engine = completed.stages![0]!;

    const stages = sut({
      ...completed,
      stages: [
        { ...engine, stage: "PREVIEW", status: "FAILED", failureCode: "PREVIEW_FAILED", retryable: true },
        { ...engine, stage: "ANALYTICAL_MATERIAL_DETECTION", required: false, status: "SKIPPED", failureCode: "MODEL_UNAVAILABLE" },
      ],
    });

    expect(stages.items.map((item) => [item.label, item.statusLabel, item.required])).toEqual([
      ["Pré-visualização", "Falhou", true],
      ["Análise: MATERIAL_DETECTION", "Ignorada", false],
    ]);
  });
});
