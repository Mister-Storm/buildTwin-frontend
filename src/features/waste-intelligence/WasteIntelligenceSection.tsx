"use client";

import { useEffect, useRef, useState } from "react";
import { Scale } from "lucide-react";
import { WasteAnalysisTable } from "@/features/waste-intelligence/WasteAnalysisTable";
import { WasteScoreCard } from "@/features/waste-intelligence/WasteScoreCard";
import {
  mapWasteIntelligenceViewModel,
  type WasteIntelligenceViewModel,
} from "@/features/waste-intelligence/waste-intelligence.mapper";
import { getProjectWasteAnalysis } from "@/features/waste-intelligence/waste-intelligence.service";
import { DEMO_ENABLED, isDemoProject } from "@/features/demo/demo-seed";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/types/api/common.api";
import type { ProjectCaptureSessionListItemDto } from "@/types/api/capture-session.api";

type WasteIntelligenceSectionProps = {
  projectId: string;
  captureSessions: ProjectCaptureSessionListItemDto[];
};

function WasteAnalysisSkeleton() {
  return (
    <div className="space-y-4" data-testid="waste-analysis-skeleton">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

export function WasteIntelligenceSection({
  projectId,
  captureSessions,
}: WasteIntelligenceSectionProps) {
  const isDemo = DEMO_ENABLED && isDemoProject(projectId);
  const defaultSessionA = captureSessions[0]?.captureSessionId ?? "";
  const defaultSessionB = captureSessions[1]?.captureSessionId ?? captureSessions[0]?.captureSessionId ?? "";

  const [captureSessionA, setCaptureSessionA] = useState(defaultSessionA);
  const [captureSessionB, setCaptureSessionB] = useState(defaultSessionB);
  const [viewModel, setViewModel] = useState<WasteIntelligenceViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedAnalysis, setHasAttemptedAnalysis] = useState(false);

  async function runAnalysis(sessionA: string, sessionB: string) {
    setError(null);
    if (!sessionA || !sessionB) {
      setError("Selecione dois levantamentos.");
      return;
    }
    if (sessionA === sessionB) {
      setError("Selecione levantamentos diferentes.");
      return;
    }

    setIsLoading(true);
    setHasAttemptedAnalysis(true);
    try {
      const result = await getProjectWasteAnalysis(projectId, sessionA, sessionB);
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

  async function handleAnalyze() {
    await runAnalysis(captureSessionA, captureSessionB);
  }

  const demoAutoPreviewScheduled = useRef(false);

  useEffect(() => {
    if (!isDemo || captureSessions.length < 2 || demoAutoPreviewScheduled.current) {
      return;
    }
    const sessionA = captureSessions[0]?.captureSessionId ?? "";
    const sessionB = captureSessions[1]?.captureSessionId ?? "";
    if (!sessionA || !sessionB || sessionA === sessionB) {
      return;
    }
    demoAutoPreviewScheduled.current = true;
    const timer = window.setTimeout(() => {
      void runAnalysis(sessionA, sessionB);
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- auto-preview once on demo mount
  }, [isDemo, projectId, captureSessions]);

  const canAnalyze = captureSessions.length >= 2;
  const showEmptyState =
    !isLoading && !viewModel && !error && (hasAttemptedAnalysis || !isDemo);

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
          disabled={isLoading || !canAnalyze}
        >
          {isLoading ? "Analisando..." : "Analisar desperdício"}
        </Button>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {isLoading ? <WasteAnalysisSkeleton /> : null}

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

        {showEmptyState ? (
          <p className="text-sm text-muted-foreground">
            Envie fotos e processe dois levantamentos para analisar desperdício.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
