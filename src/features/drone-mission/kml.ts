import type { Waypoint } from "@/features/drone-mission/drone-mission.api";

export type MissionKmlOptions = {
  name: string;
  description?: string;
};

const KML_NAMESPACE = 'xmlns="http://www.opengis.net/kml/2.2"';

function kmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatCoordinate(waypoint: Waypoint): string {
  const altitude = Number.isFinite(waypoint.altitudeMeters)
    ? waypoint.altitudeMeters
    : 0;
  return `${waypoint.lon.toFixed(7)},${waypoint.lat.toFixed(7)},${altitude.toFixed(1)}`;
}

export function buildMissionKml(
  waypoints: Waypoint[],
  options: MissionKmlOptions,
): string {
  const safeName = kmlEscape(options.name);
  const safeDescription = kmlEscape(options.description ?? "");
  const coordinates = waypoints.map(formatCoordinate).join("\n");

  const waypointPlacemarks = waypoints
    .map((waypoint, index) => {
      const cameraLabel = waypoint.triggerCamera ? " 📷" : "";
      return [
        "      <Placemark>",
        `        <name>Ponto ${index + 1}${cameraLabel}</name>`,
        "        <Style><IconStyle><scale>0.7</scale></IconStyle></Style>",
        "        <Point>",
        `          <coordinates>${formatCoordinate(waypoint)}</coordinates>`,
        "        </Point>",
        "      </Placemark>",
      ].join("\n");
    })
    .join("\n");

  return [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    `<kml ${KML_NAMESPACE}>`,
    "  <Document>",
    `    <name>${safeName}</name>`,
    safeDescription ? `    <description>${safeDescription}</description>` : "",
    "    <Folder>",
    "      <name>Rota</name>",
    "      <Placemark>",
    "        <name>Trajeto</name>",
    "        <Style><LineStyle><color>ff00ff00</color><width>3</width></LineStyle></Style>",
    "        <LineString>",
    "          <tessellate>1</tessellate>",
    `          <coordinates>${coordinates}</coordinates>`,
    "        </LineString>",
    "      </Placemark>",
    "    </Folder>",
    "    <Folder>",
    "      <name>Waypoints</name>",
    waypointPlacemarks,
    "    </Folder>",
    "  </Document>",
    "</kml>",
    "",
  ].join("\n");
}
