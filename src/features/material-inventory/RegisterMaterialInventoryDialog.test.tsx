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

describe("RegisterMaterialInventoryDialog", () => {
  beforeEach(() => {
    vi.mocked(registerMaterialInventory).mockResolvedValue({ snapshots: [] });
  });

  it("submits material inventory with storage zone", async () => {
    const user = userEvent.setup();

    render(
      <RegisterMaterialInventoryDialog
        open
        flights={[
          {
            flightId: "flight-1",
            flightDate: "2026-06-01",
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
