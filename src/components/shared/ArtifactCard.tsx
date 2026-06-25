import type { OrthomosaicViewModel } from "@/features/domain/models/orthomosaic";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/formatters";
import type { LucideIcon } from "lucide-react";
import { Calendar, Download, FileImage, HardDrive, Layers, User } from "lucide-react";

type ArtifactCardProps = {
  viewModel: OrthomosaicViewModel;
};

export function ArtifactCard({ viewModel }: ArtifactCardProps) {
  return (
    <Card className="border-border/60 bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Detalhes do Ortomosaico</CardTitle>
        <CardDescription>Preview gerado pelo pipeline BuildTwin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DetailRow
          icon={Calendar}
          label="Data da captura"
          value={
            viewModel.captureDate ? formatDate(viewModel.captureDate) : "—"
          }
        />
        {viewModel.operatorName ? (
          <DetailRow
            icon={User}
            label="Operador"
            value={viewModel.operatorName}
          />
        ) : null}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <StatusBadge
            label={viewModel.jobStatus}
            variant={viewModel.jobStatusVariant}
          />
        </div>
        <DetailRow
          icon={HardDrive}
          label="Tamanho do preview"
          value={viewModel.fileSizeLabel}
        />
        <DetailRow
          icon={Layers}
          label="Processado em"
          value={
            viewModel.processedAt
              ? formatDateTime(viewModel.processedAt)
              : "—"
          }
        />
        {viewModel.width && viewModel.height ? (
          <DetailRow
            icon={FileImage}
            label="Dimensões"
            value={`${viewModel.width} × ${viewModel.height} px`}
          />
        ) : null}
        {viewModel.downloadUrl ? (
          <a
            href={viewModel.downloadUrl}
            download
            className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Download className="size-4" />
            Baixar ortomosaico
          </a>
        ) : null}
      </CardContent>
    </Card>
  );
}

type DetailRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

function DetailRow({ icon: Icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 text-brand-support" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
