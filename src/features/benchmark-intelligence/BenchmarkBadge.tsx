import { StatusBadge } from "@/components/shared/StatusBadge";
import { BenchmarkPopover } from "@/features/benchmark-intelligence/BenchmarkPopover";
import type { BenchmarkPositionViewModel } from "@/features/benchmark-intelligence/benchmark-intelligence.mapper";

type BenchmarkBadgeProps = {
  benchmark: BenchmarkPositionViewModel | null | undefined;
};

export function BenchmarkBadge({ benchmark }: BenchmarkBadgeProps) {
  if (!benchmark) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <StatusBadge label={benchmark.bandLabel} variant={benchmark.bandVariant} />
      <BenchmarkPopover benchmark={benchmark} />
    </div>
  );
}
