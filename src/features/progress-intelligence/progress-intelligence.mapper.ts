import type {
  ProgressClassificationDto,
  VisualEvidenceStatusDto,
  VisualProgressIntelligenceDto,
} from "@/types/api/visual-progress-intelligence.api";

export type ProgressIntelligenceViewModel = {
  captureSessionAId: string;
  captureSessionBId: string;
  evidenceStatus: VisualEvidenceStatusDto;
  insightEligible: boolean;
  changePercentageLabel: string;
  classification: ProgressClassificationDto;
  classificationLabel: string;
  averageDailyChangeLabel: string;
  periodLabel: string;
  reasonLabel: string | null;
};

const UNAVAILABLE_LABEL = "Não disponível";
const INCONCLUSIVE_LABEL = "Inconclusivo";

const REASON_LABELS: Record<string, string> = {
  COMPARISON_QUALITY_LOW:
    "A qualidade da comparação entre os levantamentos é insuficiente (resolução do solo ausente ou muito diferente); a mudança visual não foi calculada.",
  INCONCLUSIVE_RECONSTRUCTION_VARIABILITY:
    "A variabilidade da reconstrução entre os levantamentos impede uma conclusão; nenhum valor de mudança visual é apresentado.",
};

export function mapProgressIntelligence(
  dto: VisualProgressIntelligenceDto,
): ProgressIntelligenceViewModel {
  const evidenceStatus = resolveEvidenceStatus(dto);
  const measured = evidenceStatus === "AVAILABLE";
  const changePercentage = dto.changePercentage;

  return {
    captureSessionAId: dto.captureSessionA,
    captureSessionBId: dto.captureSessionB,
    evidenceStatus,
    insightEligible: measured,
    changePercentageLabel:
      measured && changePercentage !== null
        ? formatChangePercentage(changePercentage)
        : withheldLabel(evidenceStatus),
    classification: dto.classification,
    classificationLabel: measured ? dto.classification : withheldLabel(evidenceStatus),
    averageDailyChangeLabel:
      measured && dto.averageDailyChange !== null
        ? formatDailyChangePercent(dto.averageDailyChange)
        : withheldLabel(evidenceStatus),
    periodLabel: formatPeriodDays(dto.deltaDays),
    reasonLabel: measured ? null : formatReason(dto.unavailableReason, evidenceStatus),
  };
}

function resolveEvidenceStatus(dto: VisualProgressIntelligenceDto): VisualEvidenceStatusDto {
  if (dto.evidenceStatus === "AVAILABLE" && dto.changePercentage === null) {
    return "UNAVAILABLE";
  }
  return dto.evidenceStatus;
}

function withheldLabel(status: VisualEvidenceStatusDto): string {
  return status === "INCONCLUSIVE" ? INCONCLUSIVE_LABEL : UNAVAILABLE_LABEL;
}

function formatReason(reason: string | null, status: VisualEvidenceStatusDto): string {
  if (reason !== null && REASON_LABELS[reason] !== undefined) {
    return REASON_LABELS[reason];
  }
  if (reason !== null && reason.trim() !== "") {
    return `Mudança visual ${status === "INCONCLUSIVE" ? "inconclusiva" : "indisponível"}: ${reason}.`;
  }
  return status === "INCONCLUSIVE"
    ? "A comparação visual entre os levantamentos é inconclusiva."
    : "A mudança visual entre os levantamentos não está disponível.";
}

function formatChangePercentage(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function formatDailyChangePercent(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}% ao dia`;
}

function formatPeriodDays(days: number): string {
  if (!Number.isFinite(days)) {
    return "Período não disponível";
  }
  if (days <= 0) {
    return "0 dias";
  }
  return days === 1 ? "1 dia" : `${days} dias`;
}
