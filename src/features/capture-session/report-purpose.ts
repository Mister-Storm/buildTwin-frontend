import type {
  ProgressReportResponseDto,
  ReportLimitationDto,
  ReportPurposeDto,
} from "@/types/api/report.api";

const PURPOSE_LABELS: Record<ReportPurposeDto, string> = {
  TECHNICAL_PHOTOGRAMMETRY: "Relatório técnico de fotogrametria",
  FALLBACK_VISUAL_EVIDENCE: "Evidência visual simplificada",
};

const LIMITATION_LABELS: Record<ReportLimitationDto, string> = {
  NOT_EXECUTIVE_PROGRESS_ASSESSMENT:
    "Não é avaliação executiva de progresso da obra",
  NO_CERTIFIED_METRIC_ACCURACY: "Sem precisão métrica certificada",
  NO_3D_RECONSTRUCTION: "Sem reconstrução 3D",
  REDUCED_METRIC_ACCURACY: "Precisão métrica reduzida",
  PROVENANCE_UNRECORDED: "Finalidade e origem não registradas",
};

const EXECUTIVE_PURPOSE = "EXECUTIVE_CONSTRUCTION_PROGRESS";

export type ReportPurposeView = {
  purposeLabel: string;
  profileLabel: string | null;
  limitationLabels: string[];
  isExecutiveClaim: boolean;
};

export function describeReportPurpose(
  report: ProgressReportResponseDto,
): ReportPurposeView {
  const purpose = report.purpose;
  const isExecutiveClaim = (purpose as string | null) === EXECUTIVE_PURPOSE;
  return {
    purposeLabel: purpose
      ? (PURPOSE_LABELS[purpose] ?? purpose)
      : "Relatório sem finalidade registrada",
    profileLabel: report.processingProfile,
    limitationLabels: report.limitations.map(
      (limitation) => LIMITATION_LABELS[limitation] ?? limitation,
    ),
    isExecutiveClaim,
  };
}
