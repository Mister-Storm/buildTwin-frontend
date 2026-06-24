"use client";

import { ImageIcon } from "lucide-react";
import { artifactPreviewUrl } from "@/services/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BuiltAreaDetectionPreviewCardProps = {
  previewArtifactId: string | null;
  detectedAreaSquareMeters: number | null;
  confidenceScore: number | null;
};

export function BuiltAreaDetectionPreviewCard({
  previewArtifactId,
  detectedAreaSquareMeters,
  confidenceScore,
}: BuiltAreaDetectionPreviewCardProps) {
  if (!previewArtifactId) {
    return null;
  }

  const previewUrl = artifactPreviewUrl(previewArtifactId);

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="size-5 text-brand-accent" />
          Pré-visualização da Detecção de Área
        </CardTitle>
        <CardDescription>
          Evidência visual da IA para demonstração e auditoria. Somente leitura.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {detectedAreaSquareMeters !== null ? (
            <span>
              Área detectada:{" "}
              <strong className="text-foreground">
                {detectedAreaSquareMeters.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} m²
              </strong>
            </span>
          ) : null}
          {confidenceScore !== null ? (
            <span>
              Confiança:{" "}
              <strong className="text-foreground">{Math.round(confidenceScore * 100)}%</strong>
            </span>
          ) : null}
        </div>
        <a href={previewUrl} target="_blank" rel="noreferrer" className="inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Pré-visualização da detecção de área construída"
            className="max-h-[480px] w-full rounded-md border border-border/60 object-contain"
          />
        </a>
      </CardContent>
    </Card>
  );
}
