import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/projects/proj-1/progress",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/services/projects.service", () => ({
  getProject: vi.fn().mockResolvedValue({ id: "proj-1", name: "Obra Teste" }),
}));

vi.mock("@/features/construction-progress/load-project-progress", () => ({
  loadProjectProgress: vi.fn(),
}));

vi.mock("@/features/construction-progress/load-project-progress-history", () => ({
  loadProjectProgressHistory: vi.fn(),
}));

import ProjectProgressPage from "@/app/projects/[projectId]/progress/page";
import { loadProjectProgress } from "@/features/construction-progress/load-project-progress";
import { loadProjectProgressHistory } from "@/features/construction-progress/load-project-progress-history";

describe("ProjectProgressPage", () => {
  it("renders progress dashboard when data is available", async () => {
    vi.mocked(loadProjectProgress).mockResolvedValue({
      status: "success",
      viewModel: {
        projectId: "proj-1",
        periodLabel: "1 de mai. de 2026 — 15 de jun. de 2026",
        timelineSize: 2,
        currentObservedAreaSquareMeters: 8421,
        deltaAreaFromFirstFlight: 5120,
        currentObservedAreaLabel: "8.421 m²",
        accumulatedEvolutionLabel: "+5.120 m²",
        lastEvolutionLabel: "+210 m²",
        averageGrowthLabel: "34,2 m²/dia",
        estimatedCompletionLabel: "+33,6%",
        dataCoverageLabel: "+100,0%",
        showEstimatedCompletion: true,
      },
    });
    vi.mocked(loadProjectProgressHistory).mockResolvedValue({
      status: "success",
      history: [
        {
          flightId: "f1",
          flightDateLabel: "1 de mai. de 2026",
          observedAreaSquareMeters: 3300,
          deltaAreaFromPreviousFlight: null,
        },
      ],
    });

    const ui = await ProjectProgressPage({
      params: Promise.resolve({ projectId: "proj-1" }),
    });
    render(ui);

    expect(screen.getByText("Progresso da Obra")).toBeInTheDocument();
    expect(screen.getByText("Área Observada Atual")).toBeInTheDocument();
    expect(screen.getByText("8.421 m²")).toBeInTheDocument();
    expect(screen.getByText("Histórico de Área Observada")).toBeInTheDocument();
  });
});
