"use client";

import { useState } from "react";
import { Boxes, GitCompareArrows, Package } from "lucide-react";
import type { MaterialInventoryViewModel } from "@/features/material-inventory/material-inventory.mapper";
import { InventoryComparePanel } from "@/features/material-inventory/InventoryComparePanel";
import { MaterialInventoryHistoryList } from "@/features/material-inventory/MaterialInventoryHistoryList";
import { RegisterMaterialInventoryDialog } from "@/features/material-inventory/RegisterMaterialInventoryDialog";
import { MetricCard } from "@/components/shared/MetricCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProjectFlightListItemDto } from "@/types/api/flight.api";

type MaterialInventorySectionProps = {
  projectId: string;
  viewModel: MaterialInventoryViewModel;
  flights: ProjectFlightListItemDto[];
};

export function MaterialInventorySection({
  projectId,
  viewModel,
  flights,
}: MaterialInventorySectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stockVariationLabel, setStockVariationLabel] = useState(viewModel.stockVariationLabel);

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Boxes className="size-5 text-brand-accent" />
              Inventário de Materiais
            </CardTitle>
            <CardDescription>
              Registro manual de estoque por levantamento. Compare variações de inventário entre
              levantamentos sem assumir consumo.
            </CardDescription>
          </div>
          <RegisterMaterialInventoryDialog
            flights={flights}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              icon={Package}
              label="Quantidade Atual"
              value={viewModel.currentQuantityLabel}
            />
            <MetricCard
              icon={GitCompareArrows}
              label="Variação de Estoque"
              value={stockVariationLabel}
            />
            <MetricCard
              icon={Boxes}
              label="Delta de Inventário"
              value="Ver comparação abaixo"
            />
          </div>
        </CardContent>
      </Card>

      <InventoryComparePanel
        projectId={projectId}
        flights={flights}
        onCompareComplete={setStockVariationLabel}
      />

      <MaterialInventoryHistoryList rows={viewModel.historyRows} />
    </div>
  );
}
