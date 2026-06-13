"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { runSystemSelfTest } from "@/services/system.service";
import type { SystemSelfTestResponseDto } from "@/types/api/system.api";
import { Loader2 } from "lucide-react";

export function DemoSelfTestPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SystemSelfTestResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setLoading(true);
    setError(null);
    try {
      const response = await runSystemSelfTest();
      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Falha ao executar self-test.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button type="button" onClick={handleRun} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Executando...
          </>
        ) : (
          "Executar Self-Test"
        )}
      </Button>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-4">
          <p className="text-sm font-medium">
            Resultado: {result.success ? "Sucesso" : "Falha"}
          </p>
          <ul className="space-y-1 text-sm">
            {result.checks.map((check) => (
              <li key={check.component} className="flex justify-between gap-4">
                <span className="capitalize">{check.component}</span>
                <span
                  className={
                    check.status === "PASS"
                      ? "text-brand-success"
                      : "text-destructive"
                  }
                >
                  {check.status}
                  {check.message ? ` — ${check.message}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
