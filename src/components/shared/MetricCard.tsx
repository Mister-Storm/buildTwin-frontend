import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  subtitle?: string | undefined;
  icon: LucideIcon;
  className?: string;
};

export function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardDescription className="text-sm font-medium">{label}</CardDescription>
        <div className="rounded-lg bg-brand-accent/10 p-2 text-brand-accent">
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-3xl font-bold tracking-tight">{value}</CardTitle>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
