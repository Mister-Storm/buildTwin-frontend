import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DetectBuiltAreaButton } from "@/features/built-area/DetectBuiltAreaButton";
import { ApiError } from "@/types/api/common.api";

const detectBuiltArea = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock("@/services/built-area.service", () => ({
  detectBuiltArea: (...args: unknown[]) => detectBuiltArea(...args),
}));

const getCapabilities = vi.fn().mockResolvedValue([]);

vi.mock("@/services/capabilities.service", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/services/capabilities.service")>()),
  getCapabilities: () => getCapabilities(),
}));

const sessions = [
  {
    captureSessionId: "flight-1",
    captureDate: "2026-06-01",
    operatorName: "Pilot",
    imageCount: 5,
    latestProcessingStatus: "COMPLETED",
    latestJobId: "job-1",
  },
];

describe("DetectBuiltAreaButton capability states", () => {
  it("should disable AI detection and show the backend reason when the capability is unavailable", async () => {
    getCapabilities.mockResolvedValueOnce([
      { name: "BUILT_AREA_DETECTION", state: "UNAVAILABLE_MISSING_RESOURCES", userFriendlyReason: "Trained model weights are not deployed." },
    ]);
    detectBuiltArea.mockClear();

    render(<DetectBuiltAreaButton captureSessions={sessions} />);

    expect(await screen.findByText("Trained model weights are not deployed.")).toBeInTheDocument();
    expect(screen.getByText("Recurso indisponível")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Detectar Área com IA/i })).toBeDisabled();
    expect(detectBuiltArea).not.toHaveBeenCalled();
  });

  it("should show a typed unavailable failure when the backend rejects detection", async () => {
    detectBuiltArea.mockRejectedValueOnce(new ApiError(400, "CAPABILITY_UNAVAILABLE", "Trained model weights are not deployed."));

    render(<DetectBuiltAreaButton captureSessions={sessions} />);
    await userEvent.click(screen.getByRole("button", { name: /Detectar Área com IA/i }));

    expect(await screen.findByText("Recurso indisponível")).toBeInTheDocument();
    expect(screen.getByText("Trained model weights are not deployed.")).toBeInTheDocument();
  });

  it("should show missing permission instead of capability state when the backend forbids the caller", async () => {
    detectBuiltArea.mockRejectedValueOnce(new ApiError(403, "FORBIDDEN", "Access is denied"));

    render(<DetectBuiltAreaButton captureSessions={sessions} />);
    await userEvent.click(screen.getByRole("button", { name: /Detectar Área com IA/i }));

    expect(await screen.findByText("Sem permissão")).toBeInTheDocument();
    expect(screen.queryByText("Recurso indisponível")).not.toBeInTheDocument();
  });
});

describe("DetectBuiltAreaButton", () => {
  it("calls detect endpoint and notifies parent", async () => {
    detectBuiltArea.mockResolvedValue({
      captureSessionId: "flight-1",
      detectedAreaSquareMeters: 1243.5,
      confidenceScore: 0.82,
      source: "AI_DETECTED",
      previewArtifactId: "preview-1",
      detectionArtifactId: "dataset-1",
    });
    const onDetected = vi.fn();

    render(
      <DetectBuiltAreaButton
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
        onDetected={onDetected}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /Detectar Área com IA/i }));

    await waitFor(() => {
      expect(detectBuiltArea).toHaveBeenCalledWith("flight-1");
      expect(onDetected).toHaveBeenCalledWith({
        previewArtifactId: "preview-1",
        detectedAreaSquareMeters: 1243.5,
        confidenceScore: 0.82,
      });
      expect(refresh).toHaveBeenCalled();
    });
  });
});
