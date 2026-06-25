import { describe, expect, it, vi } from "vitest";
import { askProjectCopilot } from "@/features/copilot-chat/copilot-chat.service";

vi.mock("@/services/api-client", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/services/api-client";

describe("copilot-chat.service", () => {
  it("posts to project copilot endpoint", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      answer: "ok",
      disclaimer: "d",
      contextGeneratedAt: "2026-01-01T00:00:00Z",
      providerId: "noop",
      model: "disabled",
      usage: null,
      latencyMs: 0,
    });

    await askProjectCopilot("p1", { message: "test" });

    expect(apiFetch).toHaveBeenCalledWith("/projects/p1/copilot/ask", {
      method: "POST",
      body: JSON.stringify({ message: "test" }),
    });
  });
});
