import type { VerticalConstructionHistoryRow } from "@/features/vertical-construction/vertical-construction.mapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { List } from "lucide-react";

type VerticalConstructionHistoryListProps = {
  rows: VerticalConstructionHistoryRow[];
};

export function VerticalConstructionHistoryList({
  rows,
}: VerticalConstructionHistoryListProps) {
  if (rows.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Construção Vertical</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum registro disponível para exibir o histórico.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <List className="size-5 text-brand-accent" />
          Histórico de Construção Vertical
        </CardTitle>
        <CardDescription>
          Rastreabilidade cronológica de área construída, pavimentos e observações por levantamento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="px-3 py-2 font-medium">Data do levantamento</th>
                <th className="px-3 py-2 font-medium">Área construída</th>
                <th className="px-3 py-2 font-medium">Pavimentos</th>
                <th className="px-3 py-2 font-medium">Observações</th>
                <th className="px-3 py-2 font-medium">Origem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.flightId}-${row.source}`} className="border-b border-border/40">
                  <td className="px-3 py-3">{row.flightDateLabel}</td>
                  <td className="px-3 py-3">{row.builtAreaLabel}</td>
                  <td className="px-3 py-3">{row.floorsLabel}</td>
                  <td className="px-3 py-3 text-muted-foreground">{row.notesLabel}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                      {row.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
