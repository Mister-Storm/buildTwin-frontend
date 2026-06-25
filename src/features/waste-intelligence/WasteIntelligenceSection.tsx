"use client";

import { useState } from "react";
import { Scale } from "lucide-react";
import { WasteAnalysisTable } from "@/features/waste-intelligence/WasteAnalysisTable";
import { WasteScoreCard } from "@/features/waste-intelligence/WasteScoreCard";
import {
  mapWasteIntelligenceViewModel,
  type WasteIntelligenceViewModel,
} from "@/features/waste-intelligence/waste-intelligence.mapper";
import { getProjectWasteAnalysis } from "@/features/waste-intelligence/waste-intelligence.service";
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

type WasteIntelligenceSectionProps = {
  projectId: string;
  captureSessions: ProjectCaptureSessionListItemDto[];
};

export function WasteIntelligenceSection({
  projectId,
  captureSessions,
}: WasteIntelligenceSectionProps) {
  const [captureSessionA, setCaptureSessionA] = useState(captureSessions[0]?.captureSessionId ?? "");
  const [captureSessionB, setCaptureSessionB] = useState(captureSessions[1]?.captureSessionId ?? captureSessions[0]?.captureSessionId ?? "");
  const [viewModel, setViewModel] = useState<WasteIntelligenceViewModel | null>(null);
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
      const result = await getProjectWasteAnalysis(projectId, captureSessionA, captureSessionB);
      setViewModel(mapWasteIntelligenceViewModel(result));
    } catch (analyzeError) {
      setViewModel(null);
      setError(
        analyzeError instanceof ApiError
          ? analyzeError.message
          : "Não foi possível analisar o desperdício de materiais.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Scale className="size-5 text-brand-accent" />
          Inteligência de Desperdício
        </CardTitle>
        <CardDescription>
          Compare o consumo real com benchmarks esperados. Indicadores factuais — sem recomendações
          automáticas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Levantamento A" htmlFor="waste-flight-a">
            <NativeSelect
              id="waste-flight-a"
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
          <FormField label="Levantamento B" htmlFor="waste-flight-b">
            <NativeSelect
              id="waste-flight-b"
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
          {isLoading ? "Analisando..." : "Analisar desperdício"}
        </Button>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {viewModel ? (
          <div className="space-y-4">
            <WasteScoreCard
              wasteScoreLabel={viewModel.wasteScoreLabel}
              materialsAtRiskLabel={viewModel.materialsAtRiskLabel}
              criticalMaterialsLabel={viewModel.criticalMaterialsLabel}
              confidenceLabel={viewModel.confidenceLabel}
              benchmarkVersionLabel={viewModel.benchmarkVersionLabel}
            />
            {viewModel.builtAreaUnavailableNote ? (
              <p className="text-sm text-muted-foreground">{viewModel.builtAreaUnavailableNote}</p>
            ) : null}
            <WasteAnalysisTable rows={viewModel.rows} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
