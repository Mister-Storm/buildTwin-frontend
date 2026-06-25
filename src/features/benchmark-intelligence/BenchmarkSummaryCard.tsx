import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PortfolioBenchmarkSummaryViewModel } from "@/features/benchmark-intelligence/benchmark-intelligence.mapper";

type BenchmarkSummaryCardProps = {
  viewModel: PortfolioBenchmarkSummaryViewModel;
};

type DistributionRowProps = {
  title: string;
  distribution: PortfolioBenchmarkSummaryViewModel["health"];
};

function DistributionRow({ title, distribution }: DistributionRowProps) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2">
      <p className="text-sm font-medium">{title}</p>
      {distribution.hasData ? (
        <dl className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div>
            <dt>P25</dt>
            <dd className="mt-0.5 font-mono text-sm text-foreground">{distribution.p25Label}</dd>
          </div>
          <div>
            <dt>P50</dt>
            <dd className="mt-0.5 font-mono text-sm text-foreground">{distribution.p50Label}</dd>
          </div>
          <div>
            <dt>P75</dt>
            <dd className="mt-0.5 font-mono text-sm text-foreground">{distribution.p75Label}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          Dados insuficientes (mínimo 5 obras ativas).
        </p>
      )}
    </div>
  );
}

export function BenchmarkSummaryCard({ viewModel }: BenchmarkSummaryCardProps) {
  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle>Benchmarks da carteira</CardTitle>
        <CardDescription>
          Distribuição por quartis (P25, P50, P75) entre {viewModel.totalProjectsUsedLabel}{" "}
          obras usadas no cálculo. Complementa as médias — não substitui os indicadores
          absolutos.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <DistributionRow title="Saúde" distribution={viewModel.health} />
        <DistributionRow title="Produtividade" distribution={viewModel.productivity} />
        <DistributionRow title="Eficiência de recursos" distribution={viewModel.waste} />
        <DistributionRow title="Cronograma" distribution={viewModel.schedule} />
      </CardContent>
    </Card>
  );
}
