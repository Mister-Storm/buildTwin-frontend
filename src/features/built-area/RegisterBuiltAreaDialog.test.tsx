import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RegisterBuiltAreaDialog } from "@/features/built-area/RegisterBuiltAreaDialog";
import { registerBuiltArea } from "@/services/built-area.service";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock("@/services/built-area.service", () => ({
  registerBuiltArea: vi.fn(),
}));

describe("RegisterBuiltAreaDialog", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("submits built area registration with floors and notes", async () => {
    const user = userEvent.setup();
    vi.mocked(registerBuiltArea).mockResolvedValue({
      id: "snap-1",
      projectId: "proj-1",
      captureSessionId: "flight-1",
      observedBuiltAreaSquareMeters: 5200,
      confidenceScore: null,
      source: "MANUAL",
      observedFloors: 4,
      notes: "Structural phase completed",
      createdAt: "2026-06-01T10:00:00Z",
    });

    render(
      <RegisterBuiltAreaDialog
        captureSessions={[
          {
            captureSessionId: "flight-1",
            captureDate: "2026-06-01",
            operatorName: "Pilot",
            imageCount: 5,
            latestProcessingStatus: "COMPLETED",
            latestJobId: "job-1",
          },
        ]}
      />,
    );

    await user.click(screen.getByText("Registrar Área Construída"));
    await user.clear(screen.getByLabelText("Área construída (m²)"));
    await user.type(screen.getByLabelText("Área construída (m²)"), "5200");
    await user.type(screen.getByLabelText("Pavimentos construídos"), "4");
    await user.type(screen.getByLabelText("Observações"), "Structural phase completed");
    await user.click(screen.getByRole("button", { name: "Registrar" }));

    await waitFor(() => {
      expect(registerBuiltArea).toHaveBeenCalledWith("flight-1", {
        observedBuiltAreaSquareMeters: 5200,
        observedFloors: 4,
        notes: "Structural phase completed",
      });
    });
    expect(refreshMock).toHaveBeenCalled();
  });
});
