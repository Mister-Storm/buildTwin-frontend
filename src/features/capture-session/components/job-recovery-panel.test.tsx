import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JobRecoveryPanel } from "@/features/capture-session/components/job-recovery-panel";
import { recoverJob } from "@/services/jobs.service";
import wire from "@/services/__fixtures__/jobs-wire.json";
import { ApiError } from "@/types/api/common.api";
import type { ProcessingJobDetailResponseDto } from "@/types/api/processing.api";

vi.mock("@/services/jobs.service", () => ({
  recoverJob: vi.fn(),
}));

const recoverable =
  wire.recoverableInterrupted.body as unknown as ProcessingJobDetailResponseDto;
const completed =
  wire.standardCompleted.body as unknown as ProcessingJobDetailResponseDto;

describe("JobRecoveryPanel", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should show the cause and recover the same job once when the operator clicks repeatedly", async () => {
    const user = userEvent.setup();
    const onRecovered = vi.fn();
    const accepted = { ...recoverable, status: "PENDING", recoverable: null, recoveryCause: null } as const;
    let resolve: (value: ProcessingJobDetailResponseDto) => void = () => {};
    vi.mocked(recoverJob).mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    render(<JobRecoveryPanel job={recoverable} onRecovered={onRecovered} />);

    expect(screen.getByText("Progresso não verificado")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Recuperar processamento" });
    await user.click(button);
    await user.click(button);
    resolve(accepted);

    await waitFor(() => expect(onRecovered).toHaveBeenCalledWith(accepted));
    expect(recoverJob).toHaveBeenCalledTimes(1);
    expect(recoverJob).toHaveBeenCalledWith(recoverable.jobId);
  });

  it("should show the server next action without reporting success when recovery is refused", async () => {
    const user = userEvent.setup();
    const onRecovered = vi.fn();
    vi.mocked(recoverJob).mockRejectedValue(
      new ApiError(
        409,
        "CONFLICT",
        "The remote execution may still be active; wait for it to finish or for supervision to classify it",
      ),
    );
    render(<JobRecoveryPanel job={recoverable} onRecovered={onRecovered} />);

    await user.click(screen.getByRole("button", { name: "Recuperar processamento" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The remote execution may still be active",
    );
    expect(onRecovered).not.toHaveBeenCalled();
  });

  it("should explain the denial when the caller cannot operate the project", async () => {
    const user = userEvent.setup();
    vi.mocked(recoverJob).mockRejectedValue(new ApiError(403, "FORBIDDEN", "Access denied"));
    render(<JobRecoveryPanel job={recoverable} onRecovered={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Recuperar processamento" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Você não tem permissão para recuperar este processamento.",
    );
  });

  it("should render nothing when the job is not recoverable", () => {
    const { container } = render(<JobRecoveryPanel job={completed} onRecovered={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
    expect(recoverJob).not.toHaveBeenCalled();
  });
});
