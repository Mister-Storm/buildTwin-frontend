import { describe, expect, it } from "vitest";
import { mapFailureReasonToFriendlyMessage } from "@/features/system/failure-reason-mapper";

describe("mapFailureReasonToFriendlyMessage", () => {
  it("maps NodeODM errors", () => {
    expect(mapFailureReasonToFriendlyMessage("NODEODM_UNAVAILABLE: down")).toBe(
      "NodeODM indisponível",
    );
  });

  it("maps processor connection errors", () => {
    expect(
      mapFailureReasonToFriendlyMessage("Processor HTTP error: 503"),
    ).toBe("Falha ao conectar ao Processor");
  });

  it("returns default for unknown errors", () => {
    expect(mapFailureReasonToFriendlyMessage("something weird")).toBe(
      "Falha no processamento",
    );
  });
});
