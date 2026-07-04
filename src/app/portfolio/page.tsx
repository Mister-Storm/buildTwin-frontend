"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ErrorState } from "@/components/shared/States";
import { PortfolioIntelligenceDashboard } from "@/features/portfolio-intelligence/PortfolioIntelligenceDashboard";
import { mapPortfolioIntelligenceViewModel } from "@/features/portfolio-intelligence/portfolio-intelligence.mapper";
import { getStoredToken } from "@/services/auth.service";

export default function PortfolioPage() {
  const [state, setState] = useState<{
    status: "loading" | "success" | "error";
    viewModel?: any;
    message?: string;
  }>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const token = getStoredToken();
      if (!token) {
        if (!cancelled) setState({ status: "error", message: "Autenticação necessária." });
        return;
      }

      try {
        const res = await fetch("/api/v1/portfolio/intelligence", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          if (res.status === 404) throw new Error("Portfólio não encontrado.");
          throw new Error(`HTTP ${res.status}`);
        }

        const dto = await res.json();
        const viewModel = mapPortfolioIntelligenceViewModel(dto);

        if (!cancelled) setState({ status: "success", viewModel });
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Não foi possível carregar a inteligência do portfólio.",
          });
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <AppShell breadcrumbs={[{ label: "Portfólio" }]}>
      <div className="space-y-8">
        <PageHeader
          title="Inteligência do Portfólio"
          description="Visão agregada de todas as obras ativas — saúde, risco, progresso e atenção executiva."
        />

        {state.status === "loading" && (
          <div className="flex items-center justify-center py-12">
            <span className="inline-block size-5 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" />
            <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
          </div>
        )}

        {state.status === "error" && (
          <ErrorState title="Não foi possível carregar" message={state.message!} />
        )}

        {state.status === "success" && state.viewModel && (
          <PortfolioIntelligenceDashboard viewModel={state.viewModel} />
        )}
      </div>
    </AppShell>
  );
}
