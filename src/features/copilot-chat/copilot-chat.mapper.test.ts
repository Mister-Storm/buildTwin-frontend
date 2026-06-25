import { describe, expect, it } from "vitest";
import { mapCopilotResponseToAssistantMessage } from "@/features/copilot-chat/copilot-chat.mapper";

describe("copilot-chat.mapper", () => {
  it("maps assistant message with disclaimer", () => {
    const message = mapCopilotResponseToAssistantMessage(
      {
        answer: "Saúde em 75 pontos.",
        disclaimer: "Não é recomendação.",
        contextGeneratedAt: "2026-01-01T00:00:00Z",
        providerId: "noop",
        model: "disabled",
        usage: null,
        latencyMs: 0,
      },
      "a1",
    );

    expect(message.role).toBe("assistant");
    expect(message.content).toContain("75");
    expect(message.disclaimer).toBe("Não é recomendação.");
  });
});
