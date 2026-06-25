"use client";

import { useState } from "react";
import { Building2, Percent, Ruler, Target } from "lucide-react";
import type { BuiltAreaViewModel } from "@/features/built-area/built-area.mapper";
import { BuiltAreaDetectionPreviewCard } from "@/features/built-area/BuiltAreaDetectionPreviewCard";
import { BuiltAreaEvolutionChart } from "@/features/built-area/BuiltAreaEvolutionChart";
import { DetectBuiltAreaButton } from "@/features/built-area/DetectBuiltAreaButton";
import { RegisterBuiltAreaDialog } from "@/features/built-area/RegisterBuiltAreaDialog";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProjectCaptureSessionListItemDto } from "@/types/api/capture-session.api";

type BuiltAreaSectionProps = {
  viewModel: BuiltAreaViewModel;
  captureSessions: ProjectCaptureSessionListItemDto[];
};

export function BuiltAreaSection({
  viewModel,
  captureSessions,
}: BuiltAreaSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewArtifactId, setPreviewArtifactId] = useState<string | null>(null);
  const [detectedAreaSquareMeters, setDetectedAreaSquareMeters] = useState<number | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="size-5 text-brand-accent" />
              Área Construída
            </CardTitle>
            <CardDescription>
              Área construída registrada manualmente ou detectada por IA. Diferente da área
              observada pelo ortomosaico.
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <DetectBuiltAreaButton
              captureSessions={captureSessions}
              onDetected={(result) => {
                setPreviewArtifactId(result.previewArtifactId);
                setDetectedAreaSquareMeters(result.detectedAreaSquareMeters);
                setConfidenceScore(result.confidenceScore);
              }}
            />
            <RegisterBuiltAreaDialog
              captureSessions={captureSessions}
              open={dialogOpen}
              onOpenChange={setDialogOpen}
            />
          </div>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              icon={Ruler}
              label="Área Construída Atual"
              value={viewModel.currentBuiltAreaLabel}
            />
            <MetricCard
              icon={Target}
              label="Área Planejada"
              value={viewModel.plannedAreaLabel}
            />
            {viewModel.showCompletion ? (
              <MetricCard
                icon={Percent}
                label="Conclusão Estimada"
                value={viewModel.completionLabel ?? "Não disponível"}
              />
            ) : null}
          </div>
        </CardContent>
      </Card>

      <BuiltAreaDetectionPreviewCard
        previewArtifactId={previewArtifactId}
        detectedAreaSquareMeters={detectedAreaSquareMeters}
        confidenceScore={confidenceScore}
      />

      {viewModel.chartPoints.length > 0 ? (
        <BuiltAreaEvolutionChart points={viewModel.chartPoints} />
      ) : null}
    </div>
  );
}
