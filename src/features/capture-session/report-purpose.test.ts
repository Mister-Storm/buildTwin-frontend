import { describe, expect, it } from "vitest";
import { describeReportPurpose } from "@/features/capture-session/report-purpose";
import type { ProgressReportResponseDto } from "@/types/api/report.api";

function report(
  overrides: Partial<ProgressReportResponseDto>,
): ProgressReportResponseDto {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    captureSessionId: "00000000-0000-4000-8000-000000000002",
    reportPath: "reports/r.pdf",
    generatedAt: "2026-11-16T12:00:00Z",
    artifactId: "00000000-0000-4000-8000-000000000003",
    purpose: null,
    processingProfile: null,
    measurementReliability: null,
    limitations: ["NOT_EXECUTIVE_PROGRESS_ASSESSMENT", "PROVENANCE_UNRECORDED"],
    ...overrides,
  };
}

describe("report purpose labels", () => {
  it("should label fallback visual evidence without an executive claim when the purpose is fallback", () => {
    const sut = describeReportPurpose(
      report({
        purpose: "FALLBACK_VISUAL_EVIDENCE",
        processingProfile: "FALLBACK",
        measurementReliability: "LOW",
        limitations: [
          "NOT_EXECUTIVE_PROGRESS_ASSESSMENT",
          "NO_CERTIFIED_METRIC_ACCURACY",
          "NO_3D_RECONSTRUCTION",
        ],
      }),
    );

    expect(sut.purposeLabel).toBe("Evidência visual simplificada");
    expect(sut.profileLabel).toBe("FALLBACK");
    expect(sut.isExecutiveClaim).toBe(false);
    expect(sut.limitationLabels).toEqual([
      "Não é avaliação executiva de progresso da obra",
      "Sem precisão métrica certificada",
      "Sem reconstrução 3D",
    ]);
  });

  it("should label technical photogrammetry when the purpose is standard processing", () => {
    const sut = describeReportPurpose(
      report({
        purpose: "TECHNICAL_PHOTOGRAMMETRY",
        processingProfile: "STANDARD",
        measurementReliability: "HIGH",
        limitations: ["NOT_EXECUTIVE_PROGRESS_ASSESSMENT"],
      }),
    );

    expect(sut.purposeLabel).toBe("Relatório técnico de fotogrametria");
    expect(sut.isExecutiveClaim).toBe(false);
  });

  it("should keep unrecorded purpose distinct from executive progress when provenance is missing", () => {
    const sut = describeReportPurpose(report({ purpose: null, artifactId: null }));

    expect(sut.purposeLabel).toBe("Relatório sem finalidade registrada");
    expect(sut.isExecutiveClaim).toBe(false);
    expect(sut.limitationLabels).toContain(
      "Finalidade e origem não registradas",
    );
  });
});
