"use client";

import { useEffect } from "react";
import { MapPin, Camera } from "lucide-react";
import dynamic from "next/dynamic";

// Leaflet components — SSR is disabled so window is available at runtime
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false },
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false },
);

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type PhotoLocation = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  thumbnailUrl?: string;
  capturedAt?: string;
};

type PhotoMapProps = {
  locations: PhotoLocation[];
  title?: string;
  description?: string;
  center?: [number, number];
  zoom?: number;
};

const DEFAULT_CENTER: [number, number] = [-23.5505, -46.6333]; // São Paulo
const DEFAULT_ZOOM = 15;

// Leaflet CSS and icon fix are loaded once on the client
function useLeafletSetup() {
  useEffect(() => {
    // Load CSS
    import("leaflet/dist/leaflet.css");

    // Fix marker icon (Leaflet + bundlers omit default asset URLs)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet") as typeof import("leaflet") & {
      _defaultIconFixed?: boolean;
    };
    if (!L._defaultIconFixed) {
      L._defaultIconFixed = true;
      const iconPrototype = L.Icon.Default.prototype as {
        _getIconUrl?: unknown;
      };
      delete iconPrototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    }
  }, []);
}

export function PhotoMap({
  locations,
  title = "Mapa da Obra",
  description = "Localização GPS das fotos capturadas",
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
}: PhotoMapProps) {
  useLeafletSetup();

  if (locations.length === 0) {
    return (
      <Card className="border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-5 text-brand-accent" />
            {title}
          </CardTitle>
          <CardDescription>
            Fotos com dados GPS aparecerão aqui. Ative a localização na câmera
            ao fotografar a obra.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Camera className="mb-2 size-12 opacity-30" />
            <p className="text-sm">Nenhuma foto georreferenciada disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="size-5 text-brand-accent" />
          {title}
        </CardTitle>
        <CardDescription>
          {description} &middot; {locations.length}{" "}
          {locations.length === 1 ? "foto" : "fotos"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full overflow-hidden rounded-lg border">
          <MapContainer
            center={center}
            zoom={zoom}
            className="h-full w-full"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((loc) => (
              <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                <Popup>
                  <div className="max-w-[200px] text-sm">
                    <p className="font-medium">{loc.label}</p>
                    {loc.capturedAt && (
                      <p className="text-xs text-muted-foreground">
                        {loc.capturedAt}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}
