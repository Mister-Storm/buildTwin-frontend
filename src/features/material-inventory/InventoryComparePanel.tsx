"use client";

import { useState } from "react";
import type { MaterialInventoryCompareRow } from "@/features/material-inventory/material-inventory.mapper";
import {
  calculateStockVariation,
  mapCompareRows,
} from "@/features/material-inventory/material-inventory.mapper";
import { compareProjectMaterialInventory } from "@/services/material-inventory.service";
import { ApiError } from "@/types/api/common.api";
import type { ProjectFlightListItemDto } from "@/types/api/flight.api";
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
import { GitCompare } from "lucide-react";

type InventoryComparePanelProps = {
  projectId: string;
  flights: ProjectFlightListItemDto[];
  onCompareComplete?: (stockVariationLabel: string) => void;
};

export function InventoryComparePanel({
  projectId,
  flights,
  onCompareComplete,
}: InventoryComparePanelProps) {
  const [flightA, setFlightA] = useState(flights[0]?.flightId ?? "");
  const [flightB, setFlightB] = useState(flights[1]?.flightId ?? flights[0]?.flightId ?? "");
  const [rows, setRows] = useState<MaterialInventoryCompareRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCompare() {
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
      const result = await compareProjectMaterialInventory(projectId, flightA, flightB);
      const compareRows = mapCompareRows(result.materials);
      setRows(compareRows);
      onCompareComplete?.(calculateStockVariation(result.materials));
    } catch (compareError) {
      setRows([]);
      setError(
        compareError instanceof ApiError
          ? compareError.message
          : "Não foi possível comparar o inventário.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <GitCompare className="size-5 text-brand-accent" />
          Comparar Inventário
        </CardTitle>
        <CardDescription>
          Compare o estoque entre dois levantamentos. O delta de inventário indica variação de
          estoque — positivo quando o estoque diminui, negativo quando há nova entrega.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Levantamento A" htmlFor="inventory-flight-a">
            <NativeSelect
              id="inventory-flight-a"
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
          <FormField label="Levantamento B" htmlFor="inventory-flight-b">
            <NativeSelect
              id="inventory-flight-b"
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
          onClick={handleCompare}
          disabled={isLoading || flights.length < 2}
        >
          {isLoading ? "Comparando..." : "Comparar"}
        </Button>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Material</th>
                  <th className="px-3 py-2 font-medium">Qtd. A</th>
                  <th className="px-3 py-2 font-medium">Qtd. B</th>
                  <th className="px-3 py-2 font-medium">Delta de Inventário</th>
                  <th className="px-3 py-2 font-medium">Zona A</th>
                  <th className="px-3 py-2 font-medium">Zona B</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.materialLabel} className="border-b border-border/40">
                    <td className="px-3 py-3">{row.materialLabel}</td>
                    <td className="px-3 py-3">{row.quantityAtFlightALabel}</td>
                    <td className="px-3 py-3">{row.quantityAtFlightBLabel}</td>
                    <td className="px-3 py-3 font-medium">{row.inventoryDeltaLabel}</td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {row.storageZoneAtFlightALabel}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {row.storageZoneAtFlightBLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
