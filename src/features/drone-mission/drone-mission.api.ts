export type GeoPoint = {
  lat: number;
  lon: number;
};

export type Waypoint = {
  lat: number;
  lon: number;
  altitudeMeters: number;
  headingDeg: number;
  triggerCamera: boolean;
  speedMps: number | null;
};

export type MissionStats = {
  areaSquareMeters: number;
  altitudeMeters: number;
  totalDistanceMeters: number;
  estimatedTimeSeconds: number;
  photoCount: number;
  photosPerM2: number;
  gsdCmPerPixel: number;
};

export type CameraInfo = {
  model: string;
  sensorWidthMm: number;
  sensorHeightMm: number;
  focalLengthMm: number;
  imageWidthPx: number;
  imageHeightPx: number;
};

export type MissionParams = {
  overlapFront: number;
  overlapSide: number;
  flightSpeedMps: number;
  marginMeters: number;
};

export type PlanMissionRequest = {
  projectId: string;
  boundary: GeoPoint[];
  photosPerM2: number;
  altitudeM: number | null;
  speedMps: number;
};

export type PlanMissionResponse = {
  waypoints: Waypoint[];
  stats: MissionStats;
  camera: CameraInfo;
  parameters: MissionParams;
};
