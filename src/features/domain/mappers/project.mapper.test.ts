import { describe, expect, it } from "vitest";
import { toProjectDetail, toProjectSummary } from "@/features/domain/mappers/project.mapper";
import type { ProjectResponseDto } from "@/types/api/project.api";

const sampleProject: ProjectResponseDto = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  companyId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  name: "Riverside Tower",
  location: {
    address: "123 Builder Ave",
    city: "Austin",
    state: "TX",
    country: "US",
    latitude: 30.2672,
    longitude: -97.7431,
  },
  startDate: "2026-01-15",
  createdAt: "2026-01-15T10:00:00Z",
  archivedAt: null,
};

describe("toProjectSummary", () => {
  it("maps active project with location label", () => {
    const summary = toProjectSummary(sampleProject);

    expect(summary.id).toBe(sampleProject.id);
    expect(summary.name).toBe("Riverside Tower");
    expect(summary.locationLabel).toBe("Austin, TX");
    expect(summary.status).toBe("active");
    expect(summary.statusLabel).toBe("Ativa");
  });

  it("maps archived project", () => {
    const summary = toProjectSummary({
      ...sampleProject,
      archivedAt: "2026-06-01T00:00:00Z",
    });

    expect(summary.status).toBe("archived");
    expect(summary.statusLabel).toBe("Arquivada");
  });
});

describe("toProjectDetail", () => {
  it("propagates location fields", () => {
    const detail = toProjectDetail(sampleProject);

    expect(detail.companyId).toBe(sampleProject.companyId);
    expect(detail.address).toBe("123 Builder Ave");
    expect(detail.city).toBe("Austin");
    expect(detail.state).toBe("TX");
    expect(detail.country).toBe("US");
    expect(detail.latitude).toBe(30.2672);
    expect(detail.longitude).toBe(-97.7431);
    expect(detail.createdAt).toEqual(new Date("2026-01-15T10:00:00Z"));
  });
});
