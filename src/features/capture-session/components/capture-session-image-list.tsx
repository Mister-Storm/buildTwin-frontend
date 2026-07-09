"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import type { CaptureImageResponseDto } from "@/types/api/capture-session.api";
import { formatDateTime, formatFileSize } from "@/lib/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteCaptureImage } from "@/services/capture-sessions.service";

type CaptureSessionImageListProps = {
  images: CaptureImageResponseDto[];
  captureSessionId: string;
  onDeleted: () => void;
};

export function CaptureSessionImageList({
  images,
  captureSessionId,
  onDeleted,
}: CaptureSessionImageListProps) {
  if (images.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Imagens</CardTitle>
          <CardDescription>Nenhuma imagem enviada ainda.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Imagens ({images.length})</CardTitle>
        <CardDescription>Arquivos enviados para este voo.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Nome</th>
                <th className="pb-2 pr-4 font-medium">Tamanho</th>
                <th className="pb-2 pr-4 font-medium">Enviado em</th>
                <th className="pb-2 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {images.map((image) => (
                <ImageRow
                  key={image.id}
                  image={image}
                  captureSessionId={captureSessionId}
                  onDeleted={onDeleted}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

type ImageRowProps = {
  image: CaptureImageResponseDto;
  captureSessionId: string;
  onDeleted: () => void;
};

function ImageRow({ image, captureSessionId, onDeleted }: ImageRowProps) {
  const [showChecksum, setShowChecksum] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteCaptureImage(captureSessionId, image.id);
      setConfirmOpen(false);
      setDeleting(false);
      onDeleted();
    } catch {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <tr className="border-b border-border/50 last:border-0">
        <td className="py-3 pr-4">
          <div className="font-medium">{image.fileName}</div>
          <button
            type="button"
            className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowChecksum((v) => !v)}
          >
            {showChecksum ? (
              <ChevronDown className="size-3" />
            ) : (
              <ChevronRight className="size-3" />
            )}
            checksum
          </button>
        </td>
        <td className="py-3 pr-4 text-muted-foreground">
          {formatFileSize(image.fileSize)}
        </td>
        <td className="py-3 pr-4 text-muted-foreground">
          {formatDateTime(new Date(image.uploadedAt))}
        </td>
        <td className="py-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
            aria-label={`Remover ${image.fileName}`}
          >
            {deleting ? (
              <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </Button>
        </td>
      </tr>
      {showChecksum ? (
        <tr>
          <td colSpan={4} className="pb-3 font-mono text-xs text-muted-foreground">
            {image.checksum}
          </td>
        </tr>
      ) : null}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover imagem</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{image.fileName}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
