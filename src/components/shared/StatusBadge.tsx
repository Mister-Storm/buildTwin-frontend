import type { StatusVariant } from "@/features/domain/models/flight";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const variantStyles: Record<StatusVariant, string> = {
  success: "border-brand-success/30 bg-brand-success/10 text-brand-success",
  warning: "border-brand-warning/30 bg-brand-warning/10 text-brand-warning",
  error: "border-destructive/30 bg-destructive/10 text-destructive",
  neutral: "border-border bg-muted text-muted-foreground",
  info: "border-brand-support/30 bg-brand-support/10 text-brand-support",
};

type StatusBadgeProps = {
  label: string;
  variant: StatusVariant;
  className?: string;
};

export function StatusBadge({ label, variant, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", variantStyles[variant], className)}
    >
      {label}
    </Badge>
  );
}
