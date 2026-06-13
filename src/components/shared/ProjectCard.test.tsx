import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectCard } from "@/components/shared/ProjectCard";
import type { ProjectSummary } from "@/features/domain/models/project";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const project: ProjectSummary = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  name: "Riverside Tower",
  locationLabel: "Austin, TX",
  startDate: new Date("2026-01-15"),
  status: "active",
  statusLabel: "Ativa",
};

describe("ProjectCard", () => {
  it("renders project name and link", () => {
    render(<ProjectCard project={project} />);

    expect(screen.getByText("Riverside Tower")).toBeInTheDocument();

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "/projects/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    );
  });
});
