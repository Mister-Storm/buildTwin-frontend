import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProjectRankingRowViewModel } from "@/features/portfolio-intelligence/portfolio-intelligence.mapper";

type WasteRankingTableProps = {
  rows: ProjectRankingRowViewModel[];
};

export function WasteRankingTable({ rows }: WasteRankingTableProps) {
  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle>Ranking de eficiência de recursos</CardTitle>
        <CardDescription>
          Ordenado por score de eficiência (maior = melhor uso de materiais).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma obra ativa no portfólio.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">#</th>
                  <th className="pb-2 pr-4 font-medium">Obra</th>
                  <th className="pb-2 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.projectId} className="border-b border-border/40">
                    <td className="py-2 pr-4">{row.rank}</td>
                    <td className="py-2 pr-4">
                      <Link
                        href={row.href}
                        className="font-medium hover:text-brand-accent hover:underline"
                      >
                        {row.projectName}
                      </Link>
                    </td>
                    <td className="py-2 text-muted-foreground">{row.metricLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
