"use client";

import { useState } from "react";
import { Building2, Percent, Ruler, Target } from "lucide-react";
import type { BuiltAreaViewModel } from "@/features/built-area/built-area.mapper";
import { BuiltAreaEvolutionChart } from "@/features/built-area/BuiltAreaEvolutionChart";
import { RegisterBuiltAreaDialog } from "@/features/built-area/RegisterBuiltAreaDialog";
import { MetricCard } from "@/components/shared/MetricCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProjectFlightListItemDto } from "@/types/api/flight.api";

type BuiltAreaSectionProps = {
  viewModel: BuiltAreaViewModel;
  flights: ProjectFlightListItemDto[];
};

export function BuiltAreaSection({
  viewModel,
  flights,
}: BuiltAreaSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

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
              Área construída registrada manualmente. Diferente da área observada pelo
              ortomosaico.
            </CardDescription>
          </div>
          <RegisterBuiltAreaDialog
            flights={flights}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        </CardHeader>
        <CardContent>
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

      {viewModel.chartPoints.length > 0 ? (
        <BuiltAreaEvolutionChart points={viewModel.chartPoints} />
      ) : null}
    </div>
  );
}
