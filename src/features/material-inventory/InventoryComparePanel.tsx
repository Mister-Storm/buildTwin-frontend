"use client";

import { useState } from "react";
import type { MaterialInventoryCompareRow } from "@/features/material-inventory/material-inventory.mapper";
import {
  calculateStockVariation,
  mapCompareRows,
} from "@/features/material-inventory/material-inventory.mapper";
import { compareProjectMaterialInventory } from "@/services/material-inventory.service";
import { ApiError } from "@/types/api/common.api";
import type { ProjectCaptureSessionListItemDto } from "@/types/api/capture-session.api";
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
  captureSessions: ProjectCaptureSessionListItemDto[];
  onCompareComplete?: (stockVariationLabel: string) => void;
};

export function InventoryComparePanel({
  projectId,
  captureSessions,
  onCompareComplete,
}: InventoryComparePanelProps) {
  const [captureSessionA, setCaptureSessionA] = useState(captureSessions[0]?.captureSessionId ?? "");
  const [captureSessionB, setCaptureSessionB] = useState(captureSessions[1]?.captureSessionId ?? captureSessions[0]?.captureSessionId ?? "");
  const [rows, setRows] = useState<MaterialInventoryCompareRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCompare() {
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
      const result = await compareProjectMaterialInventory(projectId, captureSessionA, captureSessionB);
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
          <FormField label="Levantamento B" htmlFor="inventory-flight-b">
            <NativeSelect
              id="inventory-flight-b"
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
          onClick={handleCompare}
          disabled={isLoading || captureSessions.length < 2}
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
                    <td className="px-3 py-3">{row.quantityAtCaptureSessionALabel}</td>
                    <td className="px-3 py-3">{row.quantityAtCaptureSessionBLabel}</td>
                    <td className="px-3 py-3 font-medium">{row.inventoryDeltaLabel}</td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {row.storageZoneAtCaptureSessionALabel}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {row.storageZoneAtCaptureSessionBLabel}
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
