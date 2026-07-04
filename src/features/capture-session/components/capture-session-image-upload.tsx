"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { validateImageFile } from "@/features/project/schemas/create-project.schema";
import { uploadCaptureSessionImages } from "@/services/capture-sessions.service";
import { ApiError } from "@/types/api/common.api";
import { cn } from "@/lib/utils";

const BATCH_SIZE = 5;

type QueueItem = {
  id: string;
  file: File;
  previewUrl: string;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
};

type CaptureSessionImageUploadProps = {
  captureSessionId: string;
  onUploaded: () => void;
};

export function CaptureSessionImageUpload({
  captureSessionId,
  onUploaded,
}: CaptureSessionImageUploadProps) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pendingCount = queue.filter((i) => i.status === "pending").length;

  const addFiles = useCallback((files: FileList | File[]) => {
    const next: QueueItem[] = [];
    for (const file of Array.from(files)) {
      const validationError = validateImageFile(file);
      if (validationError) {
        next.push({
          id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
          file,
          previewUrl: "",
          status: "error",
          error: validationError,
        });
        continue;
      }
      next.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: "pending",
      });
    }
    setQueue((prev) => [...prev, ...next]);
  }, []);

  useEffect(() => {
    return () => {
      for (const item of queue) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      }
    };
  }, [queue]);

  function removeItem(id: string) {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }

  async function handleUploadAll() {
    const pending = queue.filter((i) => i.status === "pending");
    if (pending.length === 0) return;

    setIsUploading(true);
    setUploadMessage(null);
    setOverallProgress(0);

    let uploaded = 0;
    const total = pending.length;

    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const batch = pending.slice(i, i + BATCH_SIZE);
      const batchIds = new Set(batch.map((b) => b.id));

      setQueue((prev) =>
        prev.map((item) =>
          batchIds.has(item.id) ? { ...item, status: "uploading" } : item,
        ),
      );

      try {
        await uploadCaptureSessionImages(
          captureSessionId,
          batch.map((b) => b.file),
          (progress) => {
            const batchFraction = progress.percent / 100;
            const doneBefore = uploaded;
            const current = doneBefore + batch.length * batchFraction;
            setOverallProgress(Math.round((current / total) * 100));
          },
        );

        uploaded += batch.length;
        setOverallProgress(Math.round((uploaded / total) * 100));
        setQueue((prev) =>
          prev.map((item) =>
            batchIds.has(item.id) ? { ...item, status: "success" } : item,
          ),
        );
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Falha no upload.";
        setQueue((prev) =>
          prev.map((item) =>
            batchIds.has(item.id)
              ? { ...item, status: "error", error: message }
              : item,
          ),
        );
        setUploadMessage(message);
        break;
      }
    }

    setIsUploading(false);
    if (uploaded > 0) {
      setUploadMessage(`${uploaded} de ${total} imagens enviadas.`);
      onUploaded();
    } else {
      // Don't overwrite the error message already set in the catch block
      // and don't trigger onUploaded — no images were actually stored
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Upload de Imagens</CardTitle>
        <CardDescription>
          Arraste fotos do drone ou selecione arquivos JPG/PNG (máx. 100MB).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files.length > 0) {
              addFiles(e.dataTransfer.files);
            }
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
            isDragging
              ? "border-brand-accent bg-brand-accent/5"
              : "border-border hover:border-brand-support/50",
          )}
        >
          <ImagePlus className="size-8 text-brand-support" />
          <p className="text-sm font-medium">Arraste imagens aqui</p>
          <p className="text-xs text-muted-foreground">
            ou clique para selecionar
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {queue.length > 0 ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>
                {queue.filter((i) => i.status === "success").length} de{" "}
                {queue.length} na fila
                {pendingCount > 0 ? ` · ${pendingCount} pendente(s)` : ""}
              </span>
              <Button
                size="sm"
                className="gap-1.5"
                disabled={pendingCount === 0 || isUploading}
                onClick={handleUploadAll}
              >
                <Upload className="size-4" />
                Enviar imagens
              </Button>
            </div>

            {isUploading || overallProgress > 0 ? (
              <div className="space-y-1">
                <Progress value={overallProgress} />
                <p className="text-xs text-muted-foreground">
                  {overallProgress}% concluído
                </p>
              </div>
            ) : null}

            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {queue.map((item) => (
                <li
                  key={item.id}
                  className="relative overflow-hidden rounded-lg border border-border/60 bg-muted/30"
                >
                  {item.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="h-28 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-28 items-center justify-center text-xs text-muted-foreground">
                      {item.file.name}
                    </div>
                  )}
                  <div className="space-y-1 p-2">
                    <p className="truncate text-xs font-medium">{item.file.name}</p>
                    <p
                      className={cn(
                        "text-xs",
                        item.status === "error"
                          ? "text-destructive"
                          : item.status === "success"
                            ? "text-brand-accent"
                            : "text-muted-foreground",
                      )}
                    >
                      {item.status === "pending" && "Pendente"}
                      {item.status === "uploading" && "Enviando..."}
                      {item.status === "success" && "Enviado"}
                      {item.status === "error" && (item.error ?? "Erro")}
                    </p>
                  </div>
                  {item.status === "pending" ? (
                    <button
                      type="button"
                      className="absolute right-2 top-2 rounded-md bg-background/80 p-1 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                      aria-label="Remover"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {uploadMessage ? (
          <p className="text-sm text-muted-foreground">{uploadMessage}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
