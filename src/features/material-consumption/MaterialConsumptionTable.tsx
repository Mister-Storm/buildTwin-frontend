import type { MaterialConsumptionRow } from "@/features/material-consumption/material-consumption.mapper";

type MaterialConsumptionTableProps = {
  rows: MaterialConsumptionRow[];
};

export function MaterialConsumptionTable({ rows }: MaterialConsumptionTableProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 text-muted-foreground">
            <th className="px-3 py-2 font-medium">Material</th>
            <th className="px-3 py-2 font-medium">Inicial</th>
            <th className="px-3 py-2 font-medium">Final</th>
            <th className="px-3 py-2 font-medium">Consumido</th>
            <th className="px-3 py-2 font-medium">Consumo/m²</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.materialLabel} className="border-b border-border/40">
              <td className="px-3 py-3">{row.materialLabel}</td>
              <td className="px-3 py-3">{row.quantityAtCaptureSessionALabel}</td>
              <td className="px-3 py-3">{row.quantityAtCaptureSessionBLabel}</td>
              <td className="px-3 py-3 font-medium">{row.quantityConsumedLabel}</td>
              <td className="px-3 py-3">{row.consumptionPerSquareMeterLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
