import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VerticalConstructionHistoryList } from "@/features/vertical-construction/VerticalConstructionHistoryList";

describe("VerticalConstructionHistoryList", () => {
  it("renders chronological history rows with notes and source", () => {
    render(
      <VerticalConstructionHistoryList
        rows={[
          {
            captureSessionId: "flight-1",
            captureDateLabel: "1 de mai. de 2026",
            builtAreaLabel: "1.000 m²",
            floorsLabel: "2",
            notesLabel: "Foundation",
            source: "MANUAL",
          },
          {
            captureSessionId: "flight-2",
            captureDateLabel: "15 de jun. de 2026",
            builtAreaLabel: "5.200 m²",
            floorsLabel: "4",
            notesLabel: "—",
            source: "ESTIMATED",
          },
        ]}
      />,
    );

    expect(screen.getByText("Histórico de Construção Vertical")).toBeInTheDocument();
    expect(screen.getByText("Foundation")).toBeInTheDocument();
    expect(screen.getByText("ESTIMATED")).toBeInTheDocument();
    expect(screen.getByText("MANUAL")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<VerticalConstructionHistoryList rows={[]} />);

    expect(
      screen.getByText("Nenhum registro disponível para exibir o histórico."),
    ).toBeInTheDocument();
  });
});
