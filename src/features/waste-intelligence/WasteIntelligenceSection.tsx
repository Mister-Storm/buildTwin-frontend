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
import type { ProjectFlightListItemDto } from "@/types/api/flight.api";

type WasteIntelligenceSectionProps = {
  projectId: string;
  flights: ProjectFlightListItemDto[];
};

export function WasteIntelligenceSection({
  projectId,
  flights,
}: WasteIntelligenceSectionProps) {
  const [flightA, setFlightA] = useState(flights[0]?.flightId ?? "");
  const [flightB, setFlightB] = useState(flights[1]?.flightId ?? flights[0]?.flightId ?? "");
  const [viewModel, setViewModel] = useState<WasteIntelligenceViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAnalyze() {
    setError(null);
    if (!flightA || !flightB) {
      setError("Selecione dois levantamentos.");
      return;
    }
    if (flightA === flightB) {
      setError("Selecione levantamentos diferentes.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await getProjectWasteAnalysis(projectId, flightA, flightB);
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
              value={flightA}
              onChange={(event) => setFlightA(event.target.value)}
              disabled={flights.length === 0 || isLoading}
            >
              {flights.map((flight) => (
                <option key={flight.flightId} value={flight.flightId}>
                  {formatDate(parseDateOnly(flight.flightDate))} — {flight.operatorName}
                </option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField label="Levantamento B" htmlFor="waste-flight-b">
            <NativeSelect
              id="waste-flight-b"
              value={flightB}
              onChange={(event) => setFlightB(event.target.value)}
              disabled={flights.length === 0 || isLoading}
            >
              {flights.map((flight) => (
                <option key={flight.flightId} value={flight.flightId}>
                  {formatDate(parseDateOnly(flight.flightDate))} — {flight.operatorName}
                </option>
              ))}
            </NativeSelect>
          </FormField>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleAnalyze}
          disabled={isLoading || flights.length < 2}
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
