import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MaterialInventorySection } from "@/features/material-inventory/MaterialInventorySection";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("MaterialInventorySection", () => {
  it("renders metric cards without consumption labels", () => {
    render(
      <MaterialInventorySection
        projectId="proj-1"
        captureSessions={[]}
        viewModel={{
          projectId: "proj-1",
          currentQuantityLabel: "3.000 (1 materiais)",
          stockVariationLabel: "Selecione dois levantamentos para comparar",
          hasSnapshots: true,
          historyRows: [],
        }}
      />,
    );

    expect(screen.getByText("Quantidade Atual")).toBeInTheDocument();
    expect(screen.getByText("Variação de Estoque")).toBeInTheDocument();
    expect(screen.getByText("Delta de Inventário")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Consumo/i })).not.toBeInTheDocument();
  });
});
