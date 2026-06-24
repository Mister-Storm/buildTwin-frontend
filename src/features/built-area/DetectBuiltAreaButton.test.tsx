import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DetectBuiltAreaButton } from "@/features/built-area/DetectBuiltAreaButton";

const detectBuiltArea = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock("@/services/built-area.service", () => ({
  detectBuiltArea: (...args: unknown[]) => detectBuiltArea(...args),
}));

describe("DetectBuiltAreaButton", () => {
  it("calls detect endpoint and notifies parent", async () => {
    detectBuiltArea.mockResolvedValue({
      flightId: "flight-1",
      detectedAreaSquareMeters: 1243.5,
      confidenceScore: 0.82,
      source: "AI_DETECTED",
      previewArtifactId: "preview-1",
      detectionArtifactId: "dataset-1",
    });
    const onDetected = vi.fn();

    render(
      <DetectBuiltAreaButton
        flights={[
          {
            flightId: "flight-1",
            flightDate: "2026-06-01",
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
