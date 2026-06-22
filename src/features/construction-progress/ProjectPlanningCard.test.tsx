import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ProjectResponseDto } from "@/types/api/project.api";
import { ApiError } from "@/types/api/common.api";

const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock("@/services/projects.service", () => ({
  updateProject: vi.fn(),
}));

import { ProjectPlanningCard } from "@/features/construction-progress/ProjectPlanningCard";
import { updateProject } from "@/services/projects.service";

const mockProject: ProjectResponseDto = {
  id: "proj-1",
  companyId: "company-1",
  name: "Obra Teste",
  location: {
    address: "Rua A",
    city: "São Paulo",
    state: "SP",
    country: "Brasil",
    latitude: -23.5,
    longitude: -46.6,
  },
  startDate: "2026-01-01",
  createdAt: "2026-01-01T00:00:00Z",
  archivedAt: null,
  plannedAreaSquareMeters: null,
  plannedFloors: null,
  projectType: null,
};

describe("ProjectPlanningCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders project type options", () => {
    render(<ProjectPlanningCard project={mockProject} />);

    expect(screen.getByRole("option", { name: "Não informado" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Edifício residencial" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Galpão / armazém" })).toBeInTheDocument();
  });

  it("shows success message after saving", async () => {
    const user = userEvent.setup();
    const updatedProject: ProjectResponseDto = {
      ...mockProject,
      plannedAreaSquareMeters: 25000,
      plannedFloors: 12,
      projectType: "RESIDENTIAL_BUILDING",
    };

    vi.mocked(updateProject).mockResolvedValue(updatedProject);

    render(<ProjectPlanningCard project={mockProject} />);

    await user.type(screen.getByLabelText("Área planejada (m²)"), "25000");
    await user.type(screen.getByLabelText("Pavimentos previstos"), "12");
    await user.selectOptions(screen.getByLabelText("Tipo de obra"), "RESIDENTIAL_BUILDING");
    await user.click(screen.getByRole("button", { name: "Salvar planejamento" }));

    await waitFor(() => {
      expect(screen.getByText("Planejamento salvo com sucesso.")).toBeInTheDocument();
    });
    expect(updateProject).toHaveBeenCalledWith("proj-1", expect.objectContaining({
      plannedAreaSquareMeters: 25000,
      plannedFloors: 12,
      projectType: "RESIDENTIAL_BUILDING",
    }));
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("shows API error message when save fails", async () => {
    const user = userEvent.setup();
    vi.mocked(updateProject).mockRejectedValue(
      new ApiError(500, "INTERNAL_ERROR", "Erro interno ao salvar"),
    );

    render(<ProjectPlanningCard project={mockProject} />);

    await user.type(screen.getByLabelText("Área planejada (m²)"), "25000");
    await user.click(screen.getByRole("button", { name: "Salvar planejamento" }));

    await waitFor(() => {
      expect(screen.getByText("Erro interno ao salvar")).toBeInTheDocument();
    });
  });

  it("shows field validation errors for invalid area", async () => {
    const user = userEvent.setup();

    render(<ProjectPlanningCard project={mockProject} />);

    await user.type(screen.getByLabelText("Área planejada (m²)"), "0");
    await user.click(screen.getByRole("button", { name: "Salvar planejamento" }));

    expect(await screen.findByText("Área planejada deve ser maior que zero")).toBeInTheDocument();
    expect(updateProject).not.toHaveBeenCalled();
  });
});
