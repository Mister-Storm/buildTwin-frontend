import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SystemHealthCard } from "@/components/shared/SystemHealthCard";
import { Server } from "lucide-react";

describe("SystemHealthCard", () => {
  it("renders service name and UP status", () => {
    render(
      <SystemHealthCard
        name="Backend"
        status="UP"
        icon={Server}
        version="0.1.0"
      />,
    );

    expect(screen.getByText("Backend")).toBeInTheDocument();
    expect(screen.getByText("UP")).toBeInTheDocument();
    expect(screen.getByText("v0.1.0")).toBeInTheDocument();
  });

  it("renders DEGRADED details", () => {
    render(
      <SystemHealthCard
        name="Processor"
        status="DEGRADED"
        icon={Server}
        details="NodeODM unavailable"
      />,
    );

    expect(screen.getByText("DEGRADED")).toBeInTheDocument();
    expect(screen.getByText("NodeODM unavailable")).toBeInTheDocument();
  });
});
