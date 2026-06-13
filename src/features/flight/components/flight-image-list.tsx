"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { FlightImageResponseDto } from "@/types/api/flight.api";
import { formatDateTime, formatFileSize } from "@/lib/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FlightImageListProps = {
  images: FlightImageResponseDto[];
};

export function FlightImageList({ images }: FlightImageListProps) {
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
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Nome</th>
                <th className="pb-2 pr-4 font-medium">Tamanho</th>
                <th className="pb-2 font-medium">Enviado em</th>
              </tr>
            </thead>
            <tbody>
              {images.map((image) => (
                <ImageRow key={image.id} image={image} />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ImageRow({ image }: { image: FlightImageResponseDto }) {
  const [showChecksum, setShowChecksum] = useState(false);

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
        <td className="py-3 text-muted-foreground">
          {formatDateTime(new Date(image.uploadedAt))}
        </td>
      </tr>
      {showChecksum ? (
        <tr>
          <td colSpan={3} className="pb-3 font-mono text-xs text-muted-foreground">
            {image.checksum}
          </td>
        </tr>
      ) : null}
    </>
  );
}
