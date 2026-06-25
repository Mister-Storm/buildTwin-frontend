export type BenchmarkScope = "PORTFOLIO" | "COMPANY";

export type BenchmarkBand =
  | "TOP_10"
  | "TOP_25"
  | "ABOVE_AVERAGE"
  | "AVERAGE"
  | "BELOW_AVERAGE"
  | "BOTTOM_10";

export type BenchmarkPositionDto = {
  percentile: number;
  band: BenchmarkBand;
  sampleSize: number;
  scope: BenchmarkScope;
};

export type BenchmarkDistributionDto = {
  p25: number | null;
  p50: number | null;
  p75: number | null;
};

export type ProjectBenchmarkIntelligenceDto = {
  healthBenchmark: BenchmarkPositionDto | null;
  productivityBenchmark: BenchmarkPositionDto | null;
  wasteBenchmark: BenchmarkPositionDto | null;
  scheduleBenchmark: BenchmarkPositionDto | null;
};

export type PortfolioBenchmarkSummaryDto = {
  healthDistribution: BenchmarkDistributionDto;
  productivityDistribution: BenchmarkDistributionDto;
  wasteDistribution: BenchmarkDistributionDto;
  scheduleDistribution: BenchmarkDistributionDto;
  totalProjectsUsed: number;
};
