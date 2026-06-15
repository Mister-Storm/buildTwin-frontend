type HeatmapViewerProps = {
  previewUrl: string;
};

export function HeatmapViewer({ previewUrl }: HeatmapViewerProps) {
  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-primary shadow-inner">
        {/* eslint-disable-next-line @next/next/no-img-element -- API binary preview stream via rewrite proxy */}
        <img
          src={previewUrl}
          alt="Mapa de calor das mudanças detectadas"
          className="max-h-[50vh] w-full object-contain p-4"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Vermelho = região alterada
      </p>
    </div>
  );
}
