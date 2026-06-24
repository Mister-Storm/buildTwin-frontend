import type { MaterialInventoryHistoryRow } from "@/features/material-inventory/material-inventory.mapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { List } from "lucide-react";

type MaterialInventoryHistoryListProps = {
  rows: MaterialInventoryHistoryRow[];
};

export function MaterialInventoryHistoryList({
  rows,
}: MaterialInventoryHistoryListProps) {
  if (rows.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Inventário</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum registro disponível para exibir o histórico.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <List className="size-5 text-brand-accent" />
          Histórico de Inventário
        </CardTitle>
        <CardDescription>
          Rastreabilidade cronológica de materiais por levantamento e registro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="px-3 py-2 font-medium">Data do levantamento</th>
                <th className="px-3 py-2 font-medium">Registrado em</th>
                <th className="px-3 py-2 font-medium">Material</th>
                <th className="px-3 py-2 font-medium">Métrica</th>
                <th className="px-3 py-2 font-medium">Valor</th>
                <th className="px-3 py-2 font-medium">Confiança</th>
                <th className="px-3 py-2 font-medium">Zona</th>
                <th className="px-3 py-2 font-medium">Movimento</th>
                <th className="px-3 py-2 font-medium">Origem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.rowKey} className="border-b border-border/40">
                  <td className="px-3 py-3">{row.flightDateLabel}</td>
                  <td className="px-3 py-3">{row.recordedAtLabel}</td>
                  <td className="px-3 py-3">{row.materialLabel}</td>
                  <td className="px-3 py-3 text-muted-foreground">{row.metricLabel}</td>
                  <td className="px-3 py-3">
                    {row.metricValueLabel} {row.unitLabel}
                  </td>
                  <td className="px-3 py-3">{row.confidenceLabel ?? "—"}</td>
                  <td className="px-3 py-3 text-muted-foreground">{row.storageZoneLabel}</td>
                  <td className="px-3 py-3">{row.movementTypeLabel}</td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        row.isAiSource
                          ? "rounded-md bg-sky-500/15 px-2 py-1 text-xs font-medium text-sky-700 dark:text-sky-300"
                          : "rounded-md bg-muted px-2 py-1 text-xs font-medium"
                      }
                    >
                      {row.isAiSource ? "IA" : row.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
