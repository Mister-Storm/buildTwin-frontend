import { afterEach, describe, expect, it, vi } from "vitest";
import { getProgressReport } from "@/services/reports.service";
import { describeReportPurpose } from "@/features/capture-session/report-purpose";
import type { ProgressReportResponseDto } from "@/types/api/report.api";

const fallbackWire: ProgressReportResponseDto = {
  id: "00000000-0000-4000-8000-000000000001",
  captureSessionId: "00000000-0000-4000-8000-000000000002",
  reportPath:
    "companies/00000000-0000-4000-8000-000000000003/projects/00000000-0000-4000-8000-000000000004/capture-sessions/00000000-0000-4000-8000-000000000002/artifacts/00000000-0000-4000-8000-000000000005/report.pdf",
  generatedAt: "2026-11-16T12:00:00Z",
  artifactId: "00000000-0000-4000-8000-000000000005",
  purpose: "FALLBACK_VISUAL_EVIDENCE",
  processingProfile: "FALLBACK",
  measurementReliability: "LOW",
  limitations: [
    "NOT_EXECUTIVE_PROGRESS_ASSESSMENT",
    "NO_CERTIFIED_METRIC_ACCURACY",
    "NO_3D_RECONSTRUCTION",
  ],
};

const technicalWire: ProgressReportResponseDto = {
  ...fallbackWire,
  id: "00000000-0000-4000-8000-000000000006",
  purpose: "TECHNICAL_PHOTOGRAMMETRY",
  processingProfile: "STANDARD",
  measurementReliability: "HIGH",
  limitations: ["NOT_EXECUTIVE_PROGRESS_ASSESSMENT"],
};

const legacyWire: ProgressReportResponseDto = {
  ...fallbackWire,
  id: "00000000-0000-4000-8000-000000000007",
  artifactId: null,
  purpose: null,
  processingProfile: null,
  measurementReliability: null,
  limitations: ["NOT_EXECUTIVE_PROGRESS_ASSESSMENT", "PROVENANCE_UNRECORDED"],
};

describe("K-D3 serialized report purpose delivery contract", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should expose fallback purpose profile and limits when the session report wire is consumed", async () => {
    const sut = getProgressReport;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(fallbackWire), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const report = await sut(fallbackWire.captureSessionId);
    const labels = describeReportPurpose(report);

    expect(report).toEqual(fallbackWire);
    expect(report.purpose).toBe("FALLBACK_VISUAL_EVIDENCE");
    expect(report.purpose).not.toBe("EXECUTIVE_CONSTRUCTION_PROGRESS");
    expect(labels.purposeLabel).toBe("Evidência visual simplificada");
    expect(labels.isExecutiveClaim).toBe(false);
  });

  it("should expose technical photogrammetry purpose when the standard report wire is consumed", async () => {
    const sut = getProgressReport;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(technicalWire), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const report = await sut(technicalWire.captureSessionId);
    const labels = describeReportPurpose(report);

    expect(report.purpose).toBe("TECHNICAL_PHOTOGRAMMETRY");
    expect(labels.purposeLabel).toBe("Relatório técnico de fotogrametria");
    expect(labels.isExecutiveClaim).toBe(false);
  });

  it("should keep legacy report identity without an executive purpose when provenance is absent", async () => {
    const sut = getProgressReport;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(legacyWire), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const report = await sut(legacyWire.captureSessionId);
    const labels = describeReportPurpose(report);

    expect(report.purpose).toBeNull();
    expect(labels.purposeLabel).toBe("Relatório sem finalidade registrada");
    expect(labels.isExecutiveClaim).toBe(false);
  });
});
