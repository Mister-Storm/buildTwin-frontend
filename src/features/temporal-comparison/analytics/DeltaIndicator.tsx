import type { DeltaDirection } from "@/features/temporal-comparison/analytics/change-analytics";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type DeltaIndicatorProps = {
  direction: DeltaDirection;
  className?: string;
};

const directionStyles: Record<Exclude<DeltaDirection, "unknown">, string> = {
  up: "text-brand-success",
  down: "text-destructive",
  stable: "text-muted-foreground",
};

export function DeltaIndicator({ direction, className }: DeltaIndicatorProps) {
  if (direction === "unknown") {
    return null;
  }

  const Icon =
    direction === "up"
      ? TrendingUp
      : direction === "down"
        ? TrendingDown
        : Minus;

  return (
    <Icon
      className={cn("size-4 shrink-0", directionStyles[direction], className)}
      aria-hidden
    />
  );
}
