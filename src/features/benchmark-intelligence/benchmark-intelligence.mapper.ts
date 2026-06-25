import type { StatusVariant } from "@/features/domain/models/capture-session";
import type {
  BenchmarkBand,
  BenchmarkDistributionDto,
  BenchmarkPositionDto,
  BenchmarkScope,
  PortfolioBenchmarkSummaryDto,
  ProjectBenchmarkIntelligenceDto,
} from "@/features/benchmark-intelligence/benchmark-intelligence.api";

export type BenchmarkPositionViewModel = {
  percentile: number;
  band: BenchmarkBand;
  bandLabel: string;
  bandVariant: StatusVariant;
  sampleSize: number;
  scope: BenchmarkScope;
  scopeLabel: string;
  detailSummary: string;
};

export type BenchmarkDistributionViewModel = {
  p25Label: string;
  p50Label: string;
  p75Label: string;
  hasData: boolean;
};

export type PortfolioBenchmarkSummaryViewModel = {
  health: BenchmarkDistributionViewModel;
  productivity: BenchmarkDistributionViewModel;
  waste: BenchmarkDistributionViewModel;
  schedule: BenchmarkDistributionViewModel;
  totalProjectsUsed: number;
  totalProjectsUsedLabel: string;
  hasSufficientSample: boolean;
};

export type ProjectBenchmarkIntelligenceViewModel = {
  healthBenchmark: BenchmarkPositionViewModel | null;
  productivityBenchmark: BenchmarkPositionViewModel | null;
  wasteBenchmark: BenchmarkPositionViewModel | null;
  scheduleBenchmark: BenchmarkPositionViewModel | null;
};

const BAND_LABELS: Record<BenchmarkBand, string> = {
  TOP_10: "Top 10%",
  TOP_25: "Top 25%",
  ABOVE_AVERAGE: "Acima da média",
  AVERAGE: "Na média",
  BELOW_AVERAGE: "Abaixo da média",
  BOTTOM_10: "10% piores",
};

const SCOPE_LABELS: Record<BenchmarkScope, string> = {
  PORTFOLIO: "Carteira ativa",
  COMPANY: "Empresa",
};

export function mapBenchmarkBandLabel(band: BenchmarkBand): string {
  return BAND_LABELS[band];
}

export function mapBenchmarkBandVariant(band: BenchmarkBand): StatusVariant {
  switch (band) {
    case "TOP_10":
    case "TOP_25":
    case "ABOVE_AVERAGE":
      return "success";
    case "AVERAGE":
      return "info";
    case "BELOW_AVERAGE":
      return "warning";
    case "BOTTOM_10":
      return "error";
  }
}

export function mapBenchmarkPosition(
  dto: BenchmarkPositionDto,
): BenchmarkPositionViewModel {
  return {
    percentile: dto.percentile,
    band: dto.band,
    bandLabel: mapBenchmarkBandLabel(dto.band),
    bandVariant: mapBenchmarkBandVariant(dto.band),
    sampleSize: dto.sampleSize,
    scope: dto.scope,
    scopeLabel: SCOPE_LABELS[dto.scope],
    detailSummary: `Percentil ${dto.percentile} entre ${dto.sampleSize} obras (${SCOPE_LABELS[dto.scope].toLowerCase()}).`,
  };
}

export function mapProjectBenchmarkIntelligence(
  dto: ProjectBenchmarkIntelligenceDto | null | undefined,
): ProjectBenchmarkIntelligenceViewModel {
  if (!dto) {
    return {
      healthBenchmark: null,
      productivityBenchmark: null,
      wasteBenchmark: null,
      scheduleBenchmark: null,
    };
  }

  return {
    healthBenchmark: dto.healthBenchmark ? mapBenchmarkPosition(dto.healthBenchmark) : null,
    productivityBenchmark: dto.productivityBenchmark
      ? mapBenchmarkPosition(dto.productivityBenchmark)
      : null,
    wasteBenchmark: dto.wasteBenchmark ? mapBenchmarkPosition(dto.wasteBenchmark) : null,
    scheduleBenchmark: dto.scheduleBenchmark
      ? mapBenchmarkPosition(dto.scheduleBenchmark)
      : null,
  };
}

export function mapPortfolioBenchmarkSummary(
  dto: PortfolioBenchmarkSummaryDto,
): PortfolioBenchmarkSummaryViewModel {
  return {
    health: mapBenchmarkDistribution(dto.healthDistribution),
    productivity: mapBenchmarkDistribution(dto.productivityDistribution),
    waste: mapBenchmarkDistribution(dto.wasteDistribution),
    schedule: mapBenchmarkDistribution(dto.scheduleDistribution),
    totalProjectsUsed: dto.totalProjectsUsed,
    totalProjectsUsedLabel: String(dto.totalProjectsUsed),
    hasSufficientSample: dto.totalProjectsUsed >= 5,
  };
}

function mapBenchmarkDistribution(
  distribution: BenchmarkDistributionDto,
): BenchmarkDistributionViewModel {
  return {
    p25Label: formatDistributionValue(distribution.p25),
    p50Label: formatDistributionValue(distribution.p50),
    p75Label: formatDistributionValue(distribution.p75),
    hasData:
      distribution.p25 != null && distribution.p50 != null && distribution.p75 != null,
  };
}

function formatDistributionValue(value: number | null): string {
  if (value == null) {
    return "—";
  }
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}
