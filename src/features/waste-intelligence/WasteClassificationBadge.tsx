import type { WasteClassification } from "@/features/waste-intelligence/waste-intelligence.api";
import { getWasteClassificationVariant } from "@/features/waste-intelligence/waste-classification.mapper";
import { StatusBadge } from "@/components/shared/StatusBadge";

type WasteClassificationBadgeProps = {
  classification: WasteClassification;
  label: string;
};

export function WasteClassificationBadge({
  classification,
  label,
}: WasteClassificationBadgeProps) {
  return <StatusBadge label={label} variant={getWasteClassificationVariant(classification)} />;
}
