import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "@/components/shared/StatusBadge";

describe("StatusBadge", () => {
  it("renders label text", () => {
    render(<StatusBadge label="Concluído" variant="success" />);

    expect(screen.getByText("Concluído")).toBeInTheDocument();
  });

  it("applies success variant styles", () => {
    render(<StatusBadge label="Concluído" variant="success" />);

    const badge = screen.getByText("Concluído");
    expect(badge.className).toContain("text-brand-success");
  });
});
