import { Building2, HeartPulse, Layers, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import type { PortfolioOverviewCardViewModel } from "@/features/portfolio-intelligence/portfolio-intelligence.mapper";

const ICONS = [Building2, HeartPulse, Layers, TrendingUp] as const;

type PortfolioOverviewCardsProps = {
  cards: PortfolioOverviewCardViewModel[];
};

export function PortfolioOverviewCards({ cards }: PortfolioOverviewCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <MetricCard
          key={card.label}
          label={card.label}
          value={card.value}
          subtitle={card.subtitle}
          icon={ICONS[index] ?? Building2}
        />
      ))}
    </div>
  );
}
