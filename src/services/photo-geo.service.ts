import type { PhotoLocation } from "@/features/spatial-intelligence/PhotoMap";

/**
 * Demo GPS metadata for photos when no real GPS-tagged images exist.
 * Uses coordinates near São Paulo (Avenida Paulista / Riverside Tower area).
 * These will be replaced by real EXIF data when the user uploads GPS-enabled photos.
 */
const DEMO_PHOTO_LOCATIONS: PhotoLocation[] = [
  {
    id: "riverside-1",
    lat: -23.5505,
    lng: -46.6333,
    label: "Riverside Tower — Tourinho",
    capturedAt: "2026-06-15 10:30",
  },
  {
    id: "riverside-2",
    lat: -23.5508,
    lng: -46.6338,
    label: "Riverside Tower — Fundação",
    capturedAt: "2026-06-22 14:15",
  },
  {
    id: "riverside-3",
    lat: -23.5502,
    lng: -46.6329,
    label: "Material Storage",
    capturedAt: "2026-06-22 14:20",
  },
  {
    id: "fulton",
    lat: -23.5512,
    lng: -46.6345,
    label: "Fulton Street Construction",
    capturedAt: "2026-06-10 09:00",
  },
  {
    id: "helsinki",
    lat: -23.5498,
    lng: -46.6320,
    label: "Residential Block A",
    capturedAt: "2026-06-18 11:00",
  },
];

export async function fetchPhotoLocations(): Promise<PhotoLocation[]> {
  // In production, this would call the processor API: GET /photos/geo
  // const apiUrl = `${getApiBase()}/photos/geo`;
  // const data = await fetch(apiUrl).then(r => r.json());
  // For now, return demo data until GPS-tagged photos are available.

  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 200));

  return DEMO_PHOTO_LOCATIONS;
}
