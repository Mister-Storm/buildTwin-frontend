import type { ComparisonViewModel } from "@/features/domain/models/temporal-comparison";

type TemporalComparisonViewerProps = {
  viewModel: ComparisonViewModel;
};

export function TemporalComparisonViewer({ viewModel }: TemporalComparisonViewerProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SurveyPreviewPanel
        title={`Levantamento A — ${viewModel.flightA.flightDateLabel}`}
        previewUrl={viewModel.flightA.previewUrl}
        operatorName={viewModel.flightA.operatorName}
      />
      <SurveyPreviewPanel
        title={`Levantamento B — ${viewModel.flightB.flightDateLabel}`}
        previewUrl={viewModel.flightB.previewUrl}
        operatorName={viewModel.flightB.operatorName}
      />
    </div>
  );
}

function SurveyPreviewPanel({
  title,
  previewUrl,
  operatorName,
}: {
  title: string;
  previewUrl: string;
  operatorName: string;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{operatorName}</p>
      </div>
      <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-primary shadow-inner">
        {/* eslint-disable-next-line @next/next/no-img-element -- API binary preview stream via rewrite proxy */}
        <img
          src={previewUrl}
          alt={title}
          className="max-h-[50vh] w-full object-contain p-4"
        />
      </div>
    </div>
  );
}
