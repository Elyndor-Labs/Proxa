"use client";

import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Badge } from "@/components/ui/badge";

const MOCK_WORDS = [
  { word: "Barcelona", chance: 65, yes: "65¢", no: "35¢" },
  { word: "2024", chance: 67, yes: "67¢", no: "33¢" },
  { word: "Griezmann", chance: 42, yes: "42¢", no: "58¢" },
  { word: "penalty", chance: 28, yes: "28¢", no: "72¢" },
] as const;

function MarketsMockup() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card">
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
        </div>
        <span className="mx-auto font-label text-xs text-muted-foreground">proxa.sol/markets</span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 md:flex-row md:p-6">
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">OPEN</Badge>
            <Badge variant="muted">Paid Market</Badge>
          </div>
          <h3 className="font-display text-sm font-bold md:text-base">
            What will be said during France vs Spain?
          </h3>

          <div className="relative min-h-[140px] flex-1 rounded-xl border border-border/50 bg-muted/30 p-4">
            <svg viewBox="0 0 300 80" className="h-full w-full" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="rgba(74,222,128,0.8)"
                strokeWidth="2"
                points="0,60 40,45 80,50 120,30 160,35 200,20 240,25 280,15 300,18"
              />
              <polyline
                fill="none"
                stroke="rgba(248,113,113,0.6)"
                strokeWidth="2"
                points="0,40 40,55 80,48 120,60 160,50 200,65 240,55 280,70 300,62"
              />
            </svg>
            <div className="absolute bottom-3 left-4 flex gap-3 font-label text-[10px]">
              <span className="text-success">Barcelona 65%</span>
              <span className="text-destructive/80">2024 67%</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border/50">
            <table className="w-full font-label text-xs">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30 text-left text-muted-foreground">
                  <th className="px-3 py-2 font-semibold">Word</th>
                  <th className="px-3 py-2 font-semibold">Chance</th>
                  <th className="px-3 py-2 text-right font-semibold">Trade</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_WORDS.map((row) => (
                  <tr key={row.word} className="border-b border-border/30 last:border-0">
                    <td className="px-3 py-2.5 font-bold">{row.word}</td>
                    <td className="px-3 py-2.5 font-semibold tabular-nums">{row.chance}%</td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-1">
                        <span className="rounded-md border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
                          Yes {row.yes}
                        </span>
                        <span className="rounded-md border border-destructive/20 bg-destructive/5 px-2 py-0.5 text-[10px] font-bold text-destructive">
                          No {row.no}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full shrink-0 rounded-xl border border-border/60 bg-background p-4 md:w-48">
          <p className="font-display text-sm font-bold">Barcelona</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-lg bg-brand py-2 font-label text-xs font-bold text-brand-foreground"
            >
              Yes 65¢
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg border border-border bg-muted/50 py-2 font-label text-xs font-bold"
            >
              No 35¢
            </button>
          </div>
          <p className="mt-4 font-label text-[10px] font-medium text-muted-foreground">USDC to spend</p>
          <p className="font-display text-2xl font-bold tabular-nums">25</p>
          <button
            type="button"
            className="mt-4 w-full rounded-lg bg-foreground py-2.5 font-label text-xs font-bold text-background transition-opacity hover:opacity-90"
          >
            Place trade
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductShowcase() {
  return (
    <section className="relative pt-2 pb-0">
      <div className="landing-showcase-shell px-[var(--container-padding)]">
        <ContainerScroll
          titleComponent={
            <div className="px-4">
              <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-brand">
                The platform
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Markets that move with the moment.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base font-medium text-muted-foreground">
                Scroll to explore the live trading interface — prices, words, and your slip in one view.
              </p>
            </div>
          }
        >
          <MarketsMockup />
        </ContainerScroll>
      </div>
    </section>
  );
}
