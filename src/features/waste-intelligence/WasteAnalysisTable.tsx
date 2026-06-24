import { WasteClassificationBadge } from "@/features/waste-intelligence/WasteClassificationBadge";
import type { WasteAnalysisRow } from "@/features/waste-intelligence/waste-intelligence.mapper";

type WasteAnalysisTableProps = {
  rows: WasteAnalysisRow[];
};

export function WasteAnalysisTable({ rows }: WasteAnalysisTableProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 text-muted-foreground">
            <th className="px-3 py-2 font-medium">Material</th>
            <th className="px-3 py-2 font-medium">Real / m²</th>
            <th className="px-3 py-2 font-medium">Esperado / m²</th>
            <th className="px-3 py-2 font-medium">Variação %</th>
            <th className="px-3 py-2 font-medium">Classificação</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.materialLabel} className="border-b border-border/40">
              <td className="px-3 py-3">
                <div>{row.materialLabel}</div>
                {row.benchmarkSourceLabel ? (
                  <div className="text-xs text-muted-foreground">{row.benchmarkSourceLabel}</div>
                ) : null}
              </td>
              <td className="px-3 py-3">{row.actualPerSquareMeterLabel}</td>
              <td className="px-3 py-3">{row.expectedPerSquareMeterLabel}</td>
              <td className="px-3 py-3 font-medium">{row.variancePercentLabel}</td>
              <td className="px-3 py-3">
                {row.classification && row.classificationLabel ? (
                  <WasteClassificationBadge
                    classification={row.classification}
                    label={row.classificationLabel}
                  />
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
