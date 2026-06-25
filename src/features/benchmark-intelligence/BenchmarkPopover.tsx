"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { BenchmarkPositionViewModel } from "@/features/benchmark-intelligence/benchmark-intelligence.mapper";
import { HelpCircle } from "lucide-react";

type BenchmarkPopoverProps = {
  benchmark: BenchmarkPositionViewModel;
};

export function BenchmarkPopover({ benchmark }: BenchmarkPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Ver detalhes do benchmark"
      >
        <HelpCircle className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <p className="text-sm font-medium">{benchmark.bandLabel}</p>
        <p className="mt-1 text-sm text-muted-foreground">{benchmark.detailSummary}</p>
        <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between gap-4">
            <dt>Percentil</dt>
            <dd className="font-mono text-foreground">{benchmark.percentile}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Amostra</dt>
            <dd className="font-mono text-foreground">{benchmark.sampleSize} obras</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Escopo</dt>
            <dd className="text-foreground">{benchmark.scopeLabel}</dd>
          </div>
        </dl>
      </PopoverContent>
    </Popover>
  );
}
