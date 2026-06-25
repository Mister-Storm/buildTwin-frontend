import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CopilotChatPanel } from "@/features/copilot-chat/CopilotChatPanel";

describe("CopilotChatPanel", () => {
  it("renders suggested prompts and disclaimer on response", async () => {
    const user = userEvent.setup();
    const onAsk = vi.fn().mockResolvedValue({
      answer: "Resposta explicativa.",
      disclaimer: "Não é recomendação.",
      contextGeneratedAt: "2026-01-01T00:00:00Z",
      providerId: "noop",
      model: "disabled",
      usage: null,
      latencyMs: 0,
    });

    render(
      <CopilotChatPanel
        scope="project"
        projectId="p1"
        suggestedPrompts={["Explique a saúde"]}
        onAsk={onAsk}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Explique a saúde" }));

    expect(onAsk).toHaveBeenCalled();
    expect(await screen.findByText("Resposta explicativa.")).toBeInTheDocument();
    expect(screen.getByText("Não é recomendação.")).toBeInTheDocument();
  });
});
