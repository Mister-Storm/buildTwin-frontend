"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { startProcessing } from "@/services/processing.service";
import { ApiError } from "@/types/api/common.api";
import type { JobStatusDto } from "@/types/api/processing.api";

type FlightProcessPanelProps = {
  flightId: string;
  imageCount: number;
  jobStatus: JobStatusDto | null;
  onStarted: (jobId: string) => void;
};

export function FlightProcessPanel({
  flightId,
  imageCount,
  jobStatus,
  onStarted,
}: FlightProcessPanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isActive = jobStatus === "PENDING" || jobStatus === "RUNNING";
  const isFailed = jobStatus === "FAILED";
  const disabled = imageCount === 0 || isActive || isSubmitting;
  const buttonLabel = isSubmitting
    ? "Iniciando..."
    : isFailed
      ? "Reprocessar Voo"
      : "Processar Voo";
  const ButtonIcon = isFailed ? RotateCcw : Play;

  async function handleProcess() {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await startProcessing(flightId);
      onStarted(response.jobId);
      router.refresh();
      document
        .getElementById("job-status-panel")
        ?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível iniciar o processamento.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Processamento</CardTitle>
        <CardDescription>
          {isFailed
            ? "O processamento anterior falhou. Dispare novamente com as imagens atuais do voo."
            : "Dispare a geração do ortomosaico após o upload das imagens."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          className="gap-1.5"
          disabled={disabled}
          onClick={handleProcess}
        >
          <ButtonIcon className="size-4" />
          {buttonLabel}
        </Button>
        {imageCount === 0 ? (
          <p className="text-sm text-muted-foreground">
            Envie pelo menos uma imagem antes de processar.
          </p>
        ) : null}
        {isActive ? (
          <p className="text-sm text-muted-foreground">
            Já existe um processamento em andamento.
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
