import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  describeCapabilityFailure,
  describeCapabilityState,
  getCapabilities,
  type CapabilitySummary,
} from "@/services/capabilities.service";
import { ApiError } from "@/types/api/common.api";

const summary = (state: CapabilitySummary["state"], reason = "Safe reason."): CapabilitySummary => ({
  name: "BUILT_AREA_DETECTION",
  state,
  userFriendlyReason: reason,
});

beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
afterEach(() => vi.unstubAllGlobals());

describe("capabilities.service", () => {
  it("should return actual capability states when the platform endpoint responds", async () => {
    const capabilities = [summary("UNAVAILABLE_MISSING_RESOURCES"), { ...summary("AVAILABLE"), name: "TEMPORAL_VISUAL_COMPARISON" }];
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ releaseVersion: "1", environmentProfile: "pilot", capabilities }), { status: 200 }));

    const sut = await getCapabilities();

    expect(sut).toEqual(capabilities);
    expect(fetch).toHaveBeenCalledWith("/api/v1/capabilities", expect.objectContaining({ cache: "no-store" }));
  });

  it("should describe missing resources with the backend reason when the capability is unavailable", () => {
    const sut = describeCapabilityState(summary("UNAVAILABLE_MISSING_RESOURCES", "Trained model weights are not deployed."));

    expect(sut).toEqual({ kind: "unavailable", title: "Recurso indisponível", message: "Trained model weights are not deployed." });
  });

  it.each(["RESTRICTED_PENDING_VALIDATION", "DEMONSTRATION_ONLY"] as const)("should describe policy restriction when the capability state is %s", (state) => {
    const sut = describeCapabilityState(summary(state, "Restricted pending validation."));

    expect(sut).toEqual({ kind: "restricted", title: "Restrito pela política comercial", message: "Restricted pending validation." });
  });

  it("should describe nothing when the capability is approved and ready", () => {
    expect(describeCapabilityState(summary("AVAILABLE"))).toBeNull();
  });

  it("should classify a typed unavailable failure separately from validation when the backend rejects execution", () => {
    const sut = describeCapabilityFailure(new ApiError(400, "CAPABILITY_UNAVAILABLE", "Trained model weights are not deployed."), "Falha");

    expect(sut).toEqual({ kind: "unavailable", title: "Recurso indisponível", message: "Trained model weights are not deployed." });
  });

  it("should classify a typed restricted failure when policy blocks execution", () => {
    const sut = describeCapabilityFailure(new ApiError(403, "CAPABILITY_RESTRICTED", "Restricted pending validation."), "Falha");

    expect(sut).toEqual({ kind: "restricted", title: "Restrito pela política comercial", message: "Restricted pending validation." });
  });

  it("should classify role denial as missing permission instead of capability state when the backend forbids the caller", () => {
    const sut = describeCapabilityFailure(new ApiError(403, "FORBIDDEN", "Access is denied"), "Falha");

    expect(sut).toEqual({ kind: "permission", title: "Sem permissão", message: "Seu perfil não permite executar esta ação neste projeto." });
  });

  it("should keep the safe message of other failures when the error is unrelated to capability", () => {
    expect(describeCapabilityFailure(new ApiError(400, "VALIDATION_ERROR", "Sem imagens."), "Falha")).toEqual({ kind: "other", title: "Falha", message: "Sem imagens." });
    expect(describeCapabilityFailure(new TypeError("network"), "Falha")).toEqual({ kind: "other", title: "Falha", message: "Falha" });
  });
});
