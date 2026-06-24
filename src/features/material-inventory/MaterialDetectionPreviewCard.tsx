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

type MaterialDetectionPreviewCardProps = {
  previewArtifactId: string | null;
};

export function MaterialDetectionPreviewCard({
  previewArtifactId,
}: MaterialDetectionPreviewCardProps) {
  if (!previewArtifactId) {
    return null;
  }

  const previewUrl = artifactPreviewUrl(previewArtifactId);

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="size-5 text-brand-accent" />
          Validação Visual da Detecção
        </CardTitle>
        <CardDescription>
          Revise as caixas detectadas pela IA antes de confiar nos números agregados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <a href={previewUrl} target="_blank" rel="noreferrer" className="inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Pré-visualização da detecção de materiais"
            className="max-h-[480px] w-full rounded-md border border-border/60 object-contain"
          />
        </a>
      </CardContent>
    </Card>
  );
}
