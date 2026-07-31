"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProtocolRow = {
  label: string;
  value: string;
};

type ProtocolSection = {
  emoji: string;
  title: string;
  note: string;
  rows: ProtocolRow[];
};

const PROTOCOL_SECTIONS: ProtocolSection[] = [
  {
    emoji: "🧱",
    title: "Materiais (diferencial)",
    note: "Fotos de celular são PERFEITAS aqui — é o que treina nosso modelo.",
    rows: [
      { label: "Ângulo", value: "90° — câmera paralela ao material" },
      { label: "Distância", value: "1–3 m (close-up)" },
      { label: "Enquadramento", value: "Material preenchendo 60–80% do quadro" },
      { label: "Iluminação", value: "Luz difusa (sombra/dia nublado), sem reflexos" },
      { label: "Quantidade", value: "50–100 fotos POR material (mín. 20): tijolo, bloco, cimento, telha" },
    ],
  },
  {
    emoji: "🏢",
    title: "Vertical / Fachada",
    note: "Celular funciona — fotografe da calçada em frente.",
    rows: [
      { label: "Ângulo", value: "0–30° — câmera na horizontal, levemente inclinada" },
      { label: "Distância", value: "10–30 m da fachada" },
      { label: "Enquadramento", value: "Fachada completa, do chão ao topo" },
      { label: "Iluminação", value: "Sol lateral (manhã/fim de tarde) destaca janelas" },
      { label: "Quantidade", value: "3–5 fotos por fachada" },
    ],
  },
  {
    emoji: "🥩",
    title: "Rebar (vergalhão)",
    note: "Modelo já treinado (87% mAP50) — vale a pena fotografar.",
    rows: [
      { label: "Ângulo", value: "45–90°" },
      { label: "Distância", value: "1–3 m" },
      { label: "Enquadramento", value: "Vergalhões visíveis, fundo limpo" },
      { label: "Quantidade", value: "5–20 fotos (fundações, lajes com ferros expostos)" },
    ],
  },
  {
    emoji: "🏗️",
    title: "Built Area / Roof (aéreo)",
    note: "Requer vista de cima — drone ou posição elevada (grua, topo).",
    rows: [
      { label: "Ângulo", value: "90° nadir (Built Area) · 45–90° (Roof)" },
      { label: "Altura", value: "20–50 m (drone) ou 5–10 m (vara)" },
      { label: "Sobreposição", value: "60–80% entre fotos (se for gerar ortomosaico)" },
      { label: "Quantidade", value: "5–20 fotos (Built Area) · 3–10 (Roof)" },
    ],
  },
];

export function CaptureGuidePanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">📷 Guia de captura</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Fotos de celular servem para a maioria das análises. O diferencial do
          BuildTwin nasce dos close-ups de materiais — quanto mais, melhor.
        </p>
        {PROTOCOL_SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-semibold">
              {section.emoji} {section.title}
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">{section.note}</p>
            <dl className="mt-1 grid grid-cols-1 gap-x-4 gap-y-0.5 text-xs sm:grid-cols-2">
              {section.rows.map((row) => (
                <div key={row.label} className="flex gap-1">
                  <dt className="shrink-0 font-medium">{row.label}:</dt>
                  <dd className="text-muted-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
