import { DEMO_ENABLED } from "@/features/demo/demo-seed";

type DemoBannerProps = {
  message?: string;
};

export function DemoBanner({
  message = "Modo demonstração — dados de exemplo enquanto o backend BuildTwin não está disponível.",
}: DemoBannerProps) {
  if (!DEMO_ENABLED) return null;

  return (
    <div className="rounded-lg border border-brand-support/30 bg-brand-support/10 px-4 py-2 text-sm text-brand-support">
      {message}
    </div>
  );
}
