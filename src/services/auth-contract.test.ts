import { afterEach, describe, expect, it, vi } from "vitest";
import { login, refreshToken } from "@/services/auth.service";
import wire from "@/services/__fixtures__/auth-wire.json";

describe("K-A1 serialized backend auth contract", () => {
  afterEach(() => {
    localStorage.clear();
    document.cookie = "buildtwin_token=; path=/; max-age=0";
    document.cookie = "buildtwin_auth=; path=/; max-age=0";
    vi.unstubAllGlobals();
  });

  it("should preserve response and cookie fields when actual backend wire is consumed", async () => {
    const sut = { login, refreshToken };
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response(JSON.stringify(wire.response))));

    expect(await sut.login("contract@example.invalid", "fixture-only")).toEqual(wire.response);
    expect(localStorage.getItem("buildtwin_token")).toBe(wire.response.token);
    expect(JSON.parse(localStorage.getItem("buildtwin_user") ?? "null")).toEqual(wire.response.user);
    expect(document.cookie).toContain(`buildtwin_token=${wire.response.token}`);
    expect(await sut.refreshToken()).toBe(wire.response.token);
    expect(fetch).toHaveBeenLastCalledWith("/api/v1/auth/refresh", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ refreshToken: wire.response.refreshToken }),
    }));
  });

  it("should carry current typed credentials when backend producer metadata is consumed", () => {
    const sut = wire.credentialMetadata;
    expect(sut.accessGeneration).toBe(sut.currentGeneration);
    expect(sut.refreshGeneration).toBe(sut.currentGeneration);
    expect(sut.accessType).toBe("access");
    expect(sut.refreshType).toBe("refresh");
    expect(wire.response.user.currentTenantId).toBe(wire.response.currentTenantId);
  });
});
