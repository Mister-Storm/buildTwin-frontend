import { afterEach, describe, expect, it, vi } from "vitest";
import { getMissionById } from "@/features/drone-mission/drone-mission-persistence.service";
import { getProject } from "@/services/projects.service";
import { getSystemOverview, getSystemReadiness } from "@/services/system.service";
import wire from "@/services/__fixtures__/scope-wire.json";

describe("K-A2 actual serialized backend scope contract", () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  function serve(body: unknown, status: number) {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })));
  }

  it("should preserve owned project fields when permitted backend wire is consumed", async () => {
    const sut = getProject;
    serve(wire.ownedProject.body, wire.ownedProject.actualStatus);
    expect(await sut(wire.ownedProject.body.id)).toEqual(wire.ownedProject.body);
    expect(fetch).toHaveBeenCalledWith(`/api/v1/projects/${wire.ownedProject.body.id}`, expect.any(Object));
  });

  it("should retain diagnostic containment when persisted mission wire is consumed", async () => {
    const sut = getMissionById;
    serve(wire.ownedMission.body, wire.ownedMission.actualStatus);
    const result = await sut(wire.ownedMission.body.id);
    expect(result).toEqual(wire.ownedMission.body);
    expect(result).toMatchObject({
      operationalExportAllowed: false,
      watermark: "NON-OPERATIONAL — NOT CERTIFIED FOR FLIGHT",
    });
  });

  it("should preserve usable session when backend forbids foreign project lookup", async () => {
    const sut = getProject;
    localStorage.setItem("buildtwin_token", "fixture-access-marker");
    serve(wire.foreignProject.body, wire.foreignProject.actualStatus);
    await expect(sut(wire.foreignProject.requestedId)).rejects.toMatchObject({
      status: wire.foreignProject.actualStatus,
      code: wire.foreignProject.body.error,
      message: wire.foreignProject.body.message,
    });
    expect(localStorage.getItem("buildtwin_token")).toBe("fixture-access-marker");
  });

  it("should consume minimal health wire when availability is public", async () => {
    const sut = getSystemReadiness;
    serve(wire.readiness.body, wire.readiness.actualStatus);
    expect(await sut()).toEqual(wire.readiness.body);
    expect(Object.keys(wire.readiness.body)).toEqual(["status"]);
  });

  it("should preserve summary wire when backend overview is consumed", async () => {
    const sut = getSystemOverview;
    serve(wire.overview.body, wire.overview.actualStatus);
    expect(await sut()).toEqual(wire.overview.body);
  });

  it("should hide resource existence when foreign producer status is certified", () => {
    const sut = wire.foreignProject;
    expect(sut.actualStatus).toBe(404);
    expect(sut.body.error).toBe("NOT_FOUND");
  });

  it("should include authorized rows only when producer summary scope is certified", () => {
    const sut = wire.overview.body.operations;
    expect(sut.projects).toBe(wire.overview.expectedProjectIds.length);
    expect(new Set(sut.recentJobs.map((job) => job.projectId))).toEqual(new Set(wire.overview.expectedProjectIds));
  });
});
