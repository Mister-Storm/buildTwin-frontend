import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScheduleRiskCard } from "@/features/forecast-intelligence/ScheduleRiskCard";

describe("ScheduleRiskCard", () => {
  it("renders schedule risk badge", () => {
    render(
      <ScheduleRiskCard
        scheduleRiskLabel="Atenção"
        scheduleRiskVariant="info"
        projectedPercentAtPlannedLabel="88,5%"
      />,
    );

    expect(screen.getByText("88,5%")).toBeInTheDocument();
    expect(screen.getByText("Atenção")).toBeInTheDocument();
  });

  it("renders message when planned date missing", () => {
    render(
      <ScheduleRiskCard
        scheduleRiskLabel={null}
        scheduleRiskVariant={null}
        projectedPercentAtPlannedLabel="—"
      />,
    );

    expect(
      screen.getByText("Informe a data prevista de conclusão no planejamento"),
    ).toBeInTheDocument();
  });
});
