import type { ProgressClassificationDto } from "@/types/api/visual-progress-intelligence.api";

const INSIGHTS: Record<ProgressClassificationDto, string> = {
  LOW: "Pouca evolução visual identificada entre os levantamentos.",
  MEDIUM: "Evolução consistente observada no período analisado.",
  HIGH: "Grande volume de alterações detectado no período.",
};

export function generateProgressInsight(
  classification: ProgressClassificationDto,
): string {
  return INSIGHTS[classification];
}
