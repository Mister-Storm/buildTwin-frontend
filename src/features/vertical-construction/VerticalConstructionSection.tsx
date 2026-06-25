"use client";

import { useState } from "react";
import type { VerticalConstructionViewModel } from "@/features/vertical-construction/vertical-construction.mapper";
import { VerticalConstructionHistoryList } from "@/features/vertical-construction/VerticalConstructionHistoryList";
import { DetectVerticalConstructionButton } from "@/features/vertical-construction/DetectVerticalConstructionButton";
import { VerticalConstructionDetectionPreviewCard } from "@/features/vertical-construction/VerticalConstructionDetectionPreviewCard";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProjectFlightListItemDto } from "@/types/api/flight.api";
import { Building, Layers, Percent, Ruler, Target } from "lucide-react";

type VerticalConstructionSectionProps = {
  viewModel: VerticalConstructionViewModel;
  flights: ProjectFlightListItemDto[];
};

export function VerticalConstructionSection({
  viewModel,
  flights,
}: VerticalConstructionSectionProps) {
  const [previewArtifactId, setPreviewArtifactId] = useState<string | null>(null);
  const [detectedFloors, setDetectedFloors] = useState<number | null>(null);
  const [estimatedHeightMeters, setEstimatedHeightMeters] = useState<number | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="size-5 text-brand-accent" />
              Construção Vertical
            </CardTitle>
            <CardDescription>
              Pavimentos detectados por IA ou registrados manualmente. Altura exibida é estimativa
              indicativa, não medição de engenharia.
            </CardDescription>
          </div>
          <DetectVerticalConstructionButton
            flights={flights}
            onDetected={(result) => {
              setPreviewArtifactId(result.previewArtifactId);
              setDetectedFloors(result.detectedFloors);
              setEstimatedHeightMeters(result.estimatedHeightMeters);
              setConfidenceScore(result.confidenceScore);
            }}
          />
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            {viewModel.sourceLabel ? (
              <StatusBadge label={viewModel.sourceLabel} variant="info" />
            ) : null}
            {viewModel.confidenceLabel ? (
              <StatusBadge label={viewModel.confidenceLabel} variant="neutral" />
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <MetricCard
              icon={Layers}
              label="Pavimentos Atuais"
              value={viewModel.currentFloorsLabel}
            />
            <MetricCard
              icon={Target}
              label="Pavimentos Planejados"
              value={viewModel.plannedFloorsLabel}
            />
            {viewModel.showVerticalCompletion ? (
              <MetricCard
                icon={Percent}
                label="Conclusão Vertical"
                value={viewModel.verticalCompletionLabel ?? "Não disponível"}
              />
            ) : null}
            <MetricCard
              icon={Ruler}
              label="Área Construída"
              value={viewModel.currentBuiltAreaLabel}
            />
            <MetricCard
              icon={Ruler}
              label="Área Média por Pavimento"
              value={viewModel.averageAreaPerFloorLabel}
            />
            <MetricCard
              icon={Ruler}
              label="Área Média Planejada/Pavimento"
              value={viewModel.plannedAverageAreaPerFloorLabel}
            />
          </div>
        </CardContent>
      </Card>

      <VerticalConstructionDetectionPreviewCard
        previewArtifactId={previewArtifactId}
        detectedFloors={detectedFloors}
        estimatedHeightMeters={estimatedHeightMeters}
        confidenceScore={confidenceScore}
      />

      <VerticalConstructionHistoryList rows={viewModel.historyRows} />
    </div>
  );
}
