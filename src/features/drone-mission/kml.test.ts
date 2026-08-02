import { describe, expect, it } from "vitest";

import type { Waypoint } from "@/features/drone-mission/drone-mission.api";
import { buildMissionKml } from "@/features/drone-mission/kml";

const WAYPOINTS: Waypoint[] = [
  {
    lat: -23.5505,
    lon: -46.6333,
    altitudeMeters: 30,
    headingDeg: 0,
    triggerCamera: true,
    speedMps: 10,
  },
  {
    lat: -23.5500,
    lon: -46.6328,
    altitudeMeters: 30,
    headingDeg: 90,
    triggerCamera: false,
    speedMps: 10,
  },
];

describe("buildMissionKml", () => {
  it("should return an XML document with the KML namespace", () => {
    const kml = buildMissionKml(WAYPOINTS, { name: "Missão Teste" });

    expect(kml.startsWith("<?xml version=\"1.0\"")).toBe(true);
    expect(kml).toContain('xmlns="http://www.opengis.net/kml/2.2"');
  });

  it("should include every waypoint as a Placemark", () => {
    const kml = buildMissionKml(WAYPOINTS, { name: "Missão Teste" });

    const placemarkCount = (kml.match(/<Placemark>/g) ?? []).length;
    expect(placemarkCount).toBe(WAYPOINTS.length + 1);
  });

  it("should write coordinates in lon,lat,alt order", () => {
    const kml = buildMissionKml(WAYPOINTS, { name: "Missão Teste" });

    expect(kml).toContain("-46.6333000,-23.5505000,30.0");
    expect(kml).toContain("-46.6328000,-23.5500000,30.0");
  });

  it("should flag camera trigger waypoints", () => {
    const kml = buildMissionKml(WAYPOINTS, { name: "Missão Teste" });

    expect(kml).toContain("Ponto 1 📷");
    expect(kml).not.toContain("Ponto 2 📷");
  });

  it("should escape XML special characters in the mission name", () => {
    const kml = buildMissionKml([], { name: "Obra <A> & \"B\"" });

    expect(kml).toContain("Obra &lt;A&gt; &amp; &quot;B&quot;");
  });

  it("should produce parseable XML", () => {
    const kml = buildMissionKml(WAYPOINTS, { name: "Missão Teste" });

    expect(() => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(kml, "text/xml");
      const error = doc.querySelector("parsererror");
      expect(error).toBeNull();
    }).not.toThrow();
  });
});
