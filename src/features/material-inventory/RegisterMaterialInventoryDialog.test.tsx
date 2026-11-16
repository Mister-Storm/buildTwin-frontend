import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterMaterialInventoryDialog } from "@/features/material-inventory/RegisterMaterialInventoryDialog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/services/material-inventory.service", () => ({
  registerMaterialInventory: vi.fn(),
}));

import { registerMaterialInventory } from "@/services/material-inventory.service";

const captureSessions = [
  {
    captureSessionId: "flight-1",
    captureDate: "2026-06-01",
    operatorName: "Pilot",
    imageCount: 0,
    latestProcessingStatus: null,
    latestJobId: null,
  },
];

describe("RegisterMaterialInventoryDialog", () => {
  beforeEach(() => {
    vi.mocked(registerMaterialInventory).mockReset();
    vi.mocked(registerMaterialInventory).mockResolvedValue({ snapshots: [] });
  });

  it("submits explicit zero quantity as observed zero", async () => {
    const user = userEvent.setup();
    render(<RegisterMaterialInventoryDialog open captureSessions={captureSessions} />);

    await user.type(screen.getByPlaceholderText("Ex.: 5000"), "0");
    await user.click(screen.getByRole("button", { name: "Registrar" }));

    await waitFor(() => {
      expect(registerMaterialInventory).toHaveBeenCalledWith("flight-1", {
        items: [expect.objectContaining({ materialType: "BRICK", quantity: 0, unit: "UNIT" })],
      });
    });
  });

  it.each([["-1"], ["abc"], ["Infinity"], [""]])(
    "rejects quantity %j without submitting",
    async (input) => {
      const user = userEvent.setup();
      render(<RegisterMaterialInventoryDialog open captureSessions={captureSessions} />);

      if (input) {
        await user.type(screen.getByPlaceholderText("Ex.: 5000"), input);
      }
      await user.click(screen.getByRole("button", { name: "Registrar" }));

      expect(await screen.findByText("Informe uma quantidade finita maior ou igual a zero.")).toBeTruthy();
      expect(registerMaterialInventory).not.toHaveBeenCalled();
    },
  );

  it("submits material inventory with storage zone", async () => {
    const user = userEvent.setup();

    render(
      <RegisterMaterialInventoryDialog
        open
        captureSessions={[
          {
            captureSessionId: "flight-1",
            captureDate: "2026-06-01",
            operatorName: "Pilot",
            status: "COMPLETED",
            imageCount: 0,
          },
        ]}
      />,
    );

    await user.type(screen.getByPlaceholderText("Ex.: 5000"), "5000");
    await user.type(screen.getByPlaceholderText("Ex.: North Yard (opcional)"), "North Yard");
    await user.click(screen.getByRole("button", { name: "Registrar" }));

    await waitFor(() => {
      expect(registerMaterialInventory).toHaveBeenCalledWith("flight-1", {
        items: [
          expect.objectContaining({
            materialType: "BRICK",
            quantity: 5000,
            unit: "UNIT",
            storageZone: "North Yard",
          }),
        ],
      });
    });
  });
});
