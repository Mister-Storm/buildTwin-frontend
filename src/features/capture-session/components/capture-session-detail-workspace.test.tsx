import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CaptureSessionDetailWorkspace } from "@/features/capture-session/components/capture-session-detail-workspace";
import { getLatestCaptureSessionJob } from "@/services/capture-sessions.service";
import { getJob, recoverJob } from "@/services/jobs.service";
import wire from "@/services/__fixtures__/jobs-wire.json";
import type { CaptureSessionDetailsResponseDto } from "@/types/api/capture-session.api";
import type {
  LatestCaptureSessionJobResponseDto,
  ProcessingJobDetailResponseDto,
} from "@/types/api/processing.api";

const refreshRoute = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshRoute, push: vi.fn() }),
}));

vi.mock("@/services/jobs.service", () => ({
  getJob: vi.fn(),
  recoverJob: vi.fn(),
}));

vi.mock("@/services/capture-sessions.service", () => ({
  getLatestCaptureSessionJob: vi.fn(),
  listCaptureSessionImages: vi.fn(),
}));

vi.mock("@/features/capture-session/components/capture-guide-panel", () => ({
  CaptureGuidePanel: () => null,
}));
vi.mock("@/features/capture-session/components/capture-session-image-upload", () => ({
  CaptureSessionImageUpload: () => null,
}));
vi.mock("@/features/capture-session/components/capture-session-image-list", () => ({
  CaptureSessionImageList: () => null,
}));
vi.mock("@/features/capture-session/components/capture-session-process-panel", () => ({
  CaptureSessionProcessPanel: ({ jobStatus }: { jobStatus: string | null }) => (
    <p data-testid="process-panel-status">{jobStatus}</p>
  ),
}));
vi.mock("@/features/capture-session/components/capture-session-results-panel", () => ({
  CaptureSessionResultsPanel: () => <p>Resultados disponíveis</p>,
}));

const recoverableDetail =
  wire.recoverableInterrupted.body as unknown as ProcessingJobDetailResponseDto;
const recoverableLatest: LatestCaptureSessionJobResponseDto = recoverableDetail;
const completedDetail =
  wire.standardCompleted.body as unknown as ProcessingJobDetailResponseDto;

const captureSession = {
  captureSessionId: recoverableDetail.captureSessionId,
  imageCount: 3,
} as unknown as CaptureSessionDetailsResponseDto;

function renderWorkspace() {
  return render(
    <CaptureSessionDetailWorkspace
      projectId="project-1"
      captureSession={captureSession}
      initialImages={[]}
      initialJob={recoverableLatest}
      initialJobDetail={recoverableDetail}
      initialReport={null}
    />,
  );
}

describe("CaptureSessionDetailWorkspace recovery", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should resume monitoring the same job when recovery is accepted", async () => {
    const user = userEvent.setup();
    const accepted = {
      ...recoverableDetail,
      status: "PENDING",
      recoverable: null,
      recoveryCause: null,
      completedAt: null,
      failureReason: null,
    } as const;
    vi.mocked(recoverJob).mockResolvedValue(accepted);
    vi.mocked(getLatestCaptureSessionJob).mockResolvedValue(accepted);
    renderWorkspace();

    await user.click(screen.getByRole("button", { name: "Recuperar processamento" }));

    await waitFor(() =>
      expect(screen.getByTestId("process-panel-status")).toHaveTextContent("PENDING"),
    );
    await waitFor(() => expect(getLatestCaptureSessionJob).toHaveBeenCalled());
    expect(screen.queryByRole("button", { name: "Recuperar processamento" })).toBeNull();
    expect(recoverJob).toHaveBeenCalledWith(recoverableDetail.jobId);
  });

  it("should show results when recovery adopts already completed output", async () => {
    const user = userEvent.setup();
    const adopted = { ...completedDetail, jobId: recoverableDetail.jobId };
    vi.mocked(recoverJob).mockResolvedValue(adopted);
    vi.mocked(getJob).mockResolvedValue(adopted);
    renderWorkspace();

    await user.click(screen.getByRole("button", { name: "Recuperar processamento" }));

    expect(await screen.findByText("Resultados disponíveis")).toBeInTheDocument();
    expect(screen.getByTestId("process-panel-status")).toHaveTextContent("COMPLETED");
    expect(refreshRoute).toHaveBeenCalled();
  });
});
