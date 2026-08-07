"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: "drone",
    title: "Drone-Powered Capture",
    description:
      "Automated aerial capture sessions with real-time telemetry and mission planning.",
  },
  {
    icon: "ai",
    title: "AI Detection Pipeline",
    description:
      "YOLO ensemble detects structural elements, progress stages, and anomalies in every frame.",
  },
  {
    icon: "twin",
    title: "Digital Twin Core",
    description:
      "Point clouds, orthomosaics, and 3D meshes unified into a living digital twin.",
  },
  {
    icon: "dashboard",
    title: "Executive Dashboard",
    description:
      "KPIs, progress tracking, and temporal comparisons for stakeholders and investors.",
  },
  {
    icon: "planning",
    title: "Mission Planning",
    description:
      "Define waypoints, export KML, and schedule recurring capture sessions.",
  },
  {
    icon: "reports",
    title: "Automated Reports",
    description:
      "Generate construction progress reports with annotated evidence artifacts.",
  },
];

function FeatureIcon({ icon }: { icon: string }) {
  const map: Record<string, React.ReactNode> = {
    drone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-7">
        <path d="M12 2L8 6h3v3.18A3 3 0 009 12v2H7a1 1 0 00-1 1v2a1 1 0 001 1h2v2a1 1 0 001 1h4a1 1 0 001-1v-2h2a1 1 0 001-1v-2a1 1 0 00-1-1h-2v-2a3 3 0 00-2-2.82V6h3L12 2z" />
        <circle cx="12" cy="12" r="1.5" />
        <path d="M7 22h10" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    ai: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-7">
        <path d="M12 2a4 4 0 014 4c0 2.21-3.58 8-4 8s-4-5.79-4-8a4 4 0 014-4z" />
        <path d="M8 14c-1.66 2.21-2 4-2 5 0 2.21 2.69 3 6 3s6-.79 6-3c0-1-.34-2.79-2-5" strokeLinecap="round" />
        <circle cx="8" cy="10" r="1" />
        <circle cx="16" cy="10" r="1" />
        <path d="M12 8v2" strokeLinecap="round" />
      </svg>
    ),
    twin: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-7">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <path d="M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4" strokeLinecap="round" />
      </svg>
    ),
    dashboard: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-7">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    planning: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-7">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M6 12l2-2M18 12l-2-2M12 6l2 2M12 18l2-2" strokeLinecap="round" />
      </svg>
    ),
    reports: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-7">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
  };
  return <>{map[icon] ?? null}</>;
}

function useIsAuthenticated(): boolean {
  const [authed] = useState(() => {
    try {
      return !!localStorage.getItem("buildtwin_token");
    } catch {
      return false;
    }
  });
  return authed;
}

const ctaLinkClass =
  "inline-flex items-center gap-1.5 rounded-lg bg-brand-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90";

const outlineLinkClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground";

export default function LandingPage() {
  const isAuthed = useIsAuthenticated();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/10 via-background to-brand-support/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-accent/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-28 sm:pt-36 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 border-brand-accent/30 text-brand-accent">
              Construction Intelligence Platform
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              See Your Construction
              <span className="mt-2 block bg-gradient-to-r from-brand-accent via-brand-support to-brand-success bg-clip-text text-transparent">
                Site Evolve
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              BuildTwin transforms drone imagery into actionable construction
              intelligence. AI-powered detection, digital twins, and automated
              reporting — all in one platform.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {isAuthed ? (
                <Link href="/dashboard" className={ctaLinkClass}>
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className={ctaLinkClass}>
                    Get Started
                  </Link>
                  <Link href="/demo" className={outlineLinkClass}>
                    Live Demo
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to monitor construction
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From drone capture to stakeholder reports — one unified platform.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card
                key={f.title}
                className="border-border/60 bg-card/50 transition-colors hover:border-brand-accent/30 hover:bg-card"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-brand-accent/10 text-brand-accent">
                    <FeatureIcon icon={f.icon} />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to transform your site?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join construction teams using BuildTwin to track progress, detect
              issues, and deliver on time.
            </p>
            <div className="mt-8">
              {isAuthed ? (
                <Link href="/dashboard" className={ctaLinkClass}>
                  Go to Dashboard
                </Link>
              ) : (
                <Link href="/login" className={ctaLinkClass}>
                  Get Started Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-brand-accent/15">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-4 text-brand-accent"
                >
                  <path d="M6 10H4a2 2 0 00-2 2v7a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                  <path d="M6 21V5a2 2 0 012-2h8a2 2 0 012 2v16" />
                  <path d="M10 12h4" />
                </svg>
              </div>
              <span className="text-sm font-semibold">BuildTwin</span>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} BuildTwin. Construction
              Intelligence Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
