import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExecutiveIntelligenceSection } from "@/features/executive-intelligence/ExecutiveIntelligenceSection";
import type { ExecutiveIntelligenceViewModel } from "@/features/executive-intelligence/executive-intelligence.mapper";
import { mapMetricExplanation } from "@/features/explainability/explainability.mapper";
import { sampleMetricExplanationDto } from "@/features/explainability/explainability.test-fixtures";

const viewModel: ExecutiveIntelligenceViewModel = {
  constructionHealthScoreLabel: "82",
  healthClassification: "GOOD",
  healthClassificationLabel: "Bom",
  healthClassificationVariant: "info",
  healthScoreBreakdown: {
    resourceEfficiencyScoreLabel: "90",
    builtAreaProgressScoreLabel: "80",
    verticalProgressScoreLabel: "70",
    dataCompletenessScoreLabel: "100",
  },
  productivityIndexLabel: "0,06 un/m²",
  productivityClassification: "NORMAL",
  productivityClassificationLabel: "Normal",
  productivityClassificationVariant: "info",
  productivityTooltip: "Indicador de produtividade material.",
  builtAreaVelocityLabel: "+8,9 m²/dia",
  floorVelocityLabel: "+0,12 pav./dia",
  wasteTrend: "IMPROVING",
  wasteTrendLabel: "Melhorando",
  generatedAtLabel: "15/06/2026, 09:00:00",
  healthExplanation: mapMetricExplanation(sampleMetricExplanationDto),
};

describe("ExecutiveIntelligenceSection", () => {
  it("renders executive intelligence cards", () => {
    render(<ExecutiveIntelligenceSection viewModel={viewModel} />);

    expect(screen.getByText("Inteligência Executiva")).toBeInTheDocument();
    expect(screen.getByText("Saúde da Obra")).toBeInTheDocument();
    expect(screen.getByText("Velocidade de Construção")).toBeInTheDocument();
    expect(screen.getByText("Produtividade Material")).toBeInTheDocument();
    expect(screen.getByText("Tendência de Eficiência")).toBeInTheDocument();
  });
});
