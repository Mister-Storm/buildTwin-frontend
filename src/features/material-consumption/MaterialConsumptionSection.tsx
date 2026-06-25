"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { ConsumptionAnalysisMetricsCards } from "@/features/material-consumption/ConsumptionAnalysisMetricsCards";
import { MaterialConsumptionTable } from "@/features/material-consumption/MaterialConsumptionTable";
import {
  mapConsumptionAnalysisViewModel,
  type ConsumptionAnalysisViewModel,
} from "@/features/material-consumption/material-consumption.mapper";
import { getProjectMaterialConsumption } from "@/features/material-consumption/material-consumption.service";
import { formatDate, parseDateOnly } from "@/lib/formatters";
import { FormField } from "@/components/shared/FormField";
import { NativeSelect } from "@/components/shared/NativeSelect";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError } from "@/types/api/common.api";
import type { ProjectCaptureSessionListItemDto } from "@/types/api/capture-session.api";

type MaterialConsumptionSectionProps = {
  projectId: string;
  captureSessions: ProjectCaptureSessionListItemDto[];
};

export function MaterialConsumptionSection({
  projectId,
  captureSessions,
}: MaterialConsumptionSectionProps) {
  const [captureSessionA, setCaptureSessionA] = useState(captureSessions[0]?.captureSessionId ?? "");
  const [captureSessionB, setCaptureSessionB] = useState(captureSessions[1]?.captureSessionId ?? captureSessions[0]?.captureSessionId ?? "");
  const [viewModel, setViewModel] = useState<ConsumptionAnalysisViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAnalyze() {
    setError(null);
    if (!captureSessionA || !captureSessionB) {
      setError("Selecione dois levantamentos.");
      return;
    }
    if (captureSessionA === captureSessionB) {
      setError("Selecione levantamentos diferentes.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await getProjectMaterialConsumption(projectId, captureSessionA, captureSessionB);
      setViewModel(mapConsumptionAnalysisViewModel(result));
    } catch (analyzeError) {
      setViewModel(null);
      setError(
        analyzeError instanceof ApiError
          ? analyzeError.message
          : "Não foi possível analisar o consumo de materiais.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="size-5 text-brand-accent" />
          Análise de Consumo de Materiais
        </CardTitle>
        <CardDescription>
          Correlacione redução de estoque com área produzida entre dois levantamentos. Consumo/m²
          é uma métrica de normalização — não indica desperdício.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Levantamento A" htmlFor="consumption-flight-a">
            <NativeSelect
              id="consumption-flight-a"
              value={captureSessionA}
              onChange={(event) => setCaptureSessionA(event.target.value)}
              disabled={captureSessions.length === 0 || isLoading}
            >
              {captureSessions.map((captureSession) => (
                <option key={captureSession.captureSessionId} value={captureSession.captureSessionId}>
                  {formatDate(parseDateOnly(captureSession.captureDate))} — {captureSession.operatorName}
                </option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField label="Levantamento B" htmlFor="consumption-flight-b">
            <NativeSelect
              id="consumption-flight-b"
              value={captureSessionB}
              onChange={(event) => setCaptureSessionB(event.target.value)}
              disabled={captureSessions.length === 0 || isLoading}
            >
              {captureSessions.map((captureSession) => (
                <option key={captureSession.captureSessionId} value={captureSession.captureSessionId}>
                  {formatDate(parseDateOnly(captureSession.captureDate))} — {captureSession.operatorName}
                </option>
              ))}
            </NativeSelect>
          </FormField>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleAnalyze}
          disabled={isLoading || captureSessions.length < 2}
        >
          {isLoading ? "Analisando..." : "Analisar consumo"}
        </Button>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {viewModel ? (
          <div className="space-y-4">
            <ConsumptionAnalysisMetricsCards
              builtAreaDeltaLabel={viewModel.builtAreaDeltaLabel}
              totalConsumedMaterialsLabel={viewModel.totalConsumedMaterialsLabel}
            />
            {viewModel.builtAreaUnavailableNote ? (
              <p className="text-sm text-muted-foreground">{viewModel.builtAreaUnavailableNote}</p>
            ) : null}
            <MaterialConsumptionTable rows={viewModel.rows} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
