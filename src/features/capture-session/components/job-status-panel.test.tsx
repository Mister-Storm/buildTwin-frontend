import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JobStatusPanel } from "@/features/capture-session/components/job-status-panel";
import wire from "@/services/__fixtures__/jobs-wire.json";
import type { LatestCaptureSessionJobResponseDto } from "@/types/api/processing.api";

vi.mock("@/services/jobs.service", () => ({
  recoverJob: vi.fn(),
}));

const recoverable =
  wire.recoverableInterrupted.body as unknown as LatestCaptureSessionJobResponseDto;
const completed =
  wire.standardCompleted.body as unknown as LatestCaptureSessionJobResponseDto;
const failed =
  wire.failedAfterEngine.body as unknown as LatestCaptureSessionJobResponseDto;

describe("JobStatusPanel", () => {
  it("should list recorded stages with counts when the job completed", () => {
    render(<JobStatusPanel imageCount={77} job={completed} onRecovered={vi.fn()} />);

    const stages = screen.getByRole("list", { name: "Etapas do processamento" });
    expect(within(stages).getByText("Reconstrução fotogramétrica")).toBeInTheDocument();
    expect(within(stages).getByText("77 de 77 imagens reconstruídas")).toBeInTheDocument();
    expect(within(stages).getAllByText("Concluída")).toHaveLength(5);
    expect(screen.queryByRole("button", { name: "Recuperar processamento" })).toBeNull();
  });

  it("should disclose missing stage evidence instead of implying success when the job failed", () => {
    render(<JobStatusPanel imageCount={3} job={failed} onRecovered={vi.fn()} />);

    expect(
      screen.getByText(
        "As etapas deste processamento não foram registradas; não é possível confirmar quais etapas foram concluídas.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Recuperar processamento" })).toBeNull();
  });

  it("should offer same-job recovery alongside reprocessing when the failure is recoverable", () => {
    render(<JobStatusPanel imageCount={3} job={recoverable} onRecovered={vi.fn()} />);

    expect(screen.getByText("Progresso não verificado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recuperar processamento" })).toBeEnabled();
    expect(screen.getByText(/Reprocessar Captura/)).toBeInTheDocument();
  });

  it("should not show stages while the job is still running", () => {
    render(
      <JobStatusPanel
        imageCount={3}
        job={{ ...completed, status: "RUNNING", completedAt: null }}
        onRecovered={vi.fn()}
      />,
    );

    expect(screen.queryByRole("list", { name: "Etapas do processamento" })).toBeNull();
  });

  it("should not mark full reconstruction done when the engine stage fell back", () => {
    const engine = completed.stages![0]!;
    render(
      <JobStatusPanel
        imageCount={3}
        job={{ ...completed, stages: [{ ...engine, processingProfile: "FALLBACK" }] }}
      />,
    );

    expect(
      screen.getByText("Reconstrução completa indisponível (modo simplificado)"),
    ).toBeInTheDocument();
  });
});
