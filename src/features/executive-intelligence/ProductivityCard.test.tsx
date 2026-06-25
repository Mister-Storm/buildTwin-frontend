import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductivityCard } from "@/features/executive-intelligence/ProductivityCard";

describe("ProductivityCard", () => {
  it("renders productivity index and classification badge", () => {
    render(
      <ProductivityCard
        viewModel={{
          productivityIndexLabel: "0,06 un/m²",
          productivityClassificationLabel: "Normal",
          productivityClassificationVariant: "info",
          productivityTooltip: "Indicador de produtividade material.",
        }}
      />,
    );

    expect(screen.getByText("Produtividade Material")).toBeInTheDocument();
    expect(screen.getByText("0,06 un/m²")).toBeInTheDocument();
    expect(screen.getByText("Normal")).toBeInTheDocument();
  });
});
