"use client";

import { Info, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Pick a Free Market",
    description:
      "Every market is tied to a live event — a stream, podcast, or tournament. Each has words you can trade on.",
    markets: [
      { icon: "🎙️", title: "Joe Rogan #2210: Elon Musk", tag: "Free", words: ["Mars 72¢", "simulation 58¢"], traders: 847 },
      { icon: "🗣️", title: "Presidential Debate Night", tag: "Free", words: ["tariffs 69¢", "border 85¢"], traders: 4521 },
      { icon: "💻", title: "Apple WWDC Keynote", tag: "Paid", words: ["AI 96¢", "Vision 71¢"], traders: 1402 },
    ],
  },
  {
    title: "Browse the Words",
    description: "Each market has words with live prices. YES means you think it'll be said. Prices move with the crowd.",
    words: [
      { word: "GG", yes: "42¢", no: "58¢", vol: "2.1k" },
      { word: "nerf", yes: "35¢", no: "65¢", vol: "1.8k" },
      { word: "clutch", yes: "61¢", no: "39¢", vol: "3.2k" },
    ],
  },
  {
    title: "Place Your Trade",
    description: "Pick YES or NO, enter your amount, and see exactly what you'll win before you confirm.",
    trade: { word: "GG", yes: "42¢", payout: "116.2", profit: "+66.2" },
  },
  {
    title: "Collect Your Winnings",
    description: "Event ends, transcript is checked. If your word was said and you held YES, you win. One click to claim.",
    result: { word: "GG", shares: "116.2", cost: "$50.00", payout: "$116.20", profit: "+$66.20 (+132%)" },
  },
] as const;

interface HowItWorksModalProps {
  open: boolean;
  onClose: () => void;
}

function StepContent({ step }: { step: number }) {
  const data = STEPS[step];

  if ("markets" in data && data.markets) {
    return (
      <div className="space-y-2">
        {data.markets.map((market, i) => (
          <div
            key={market.title}
            className={cn(
              "rounded-xl border bg-muted/40 p-3 transition-colors",
              i === 0 ? "border-brand/40" : "border-border",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{market.icon}</span>
                <div>
                  <p className="font-label text-sm font-medium">{market.title}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="rounded bg-brand/15 px-1.5 py-0.5 font-label text-[10px] text-brand">
                      {market.tag}
                    </span>
                    {market.words.map((w) => (
                      <span key={w} className="font-label text-[10px] text-muted-foreground">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <span className="shrink-0 font-label text-[10px] text-muted-foreground">
                {market.traders.toLocaleString()} traders
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if ("words" in data && data.words) {
    return (
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full font-label text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-3 py-2 text-left">Word</th>
              <th className="px-3 py-2 text-left">YES</th>
              <th className="px-3 py-2 text-left">NO</th>
              <th className="px-3 py-2 text-right">Vol</th>
            </tr>
          </thead>
          <tbody>
            {data.words.map((row) => (
              <tr key={row.word} className="border-b border-border/50">
                <td className="px-3 py-2 font-medium">{row.word}</td>
                <td className="px-3 py-2 text-success">{row.yes}</td>
                <td className="px-3 py-2 text-destructive">{row.no}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">{row.vol}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if ("trade" in data && data.trade) {
    const t = data.trade;
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="font-label text-xs text-muted-foreground">Selected word</p>
        <p className="font-display text-lg font-semibold">&quot;{t.word}&quot;</p>
        <div className="mt-3 flex gap-2">
          <div className="flex-1 rounded-lg bg-success/15 py-2 text-center font-label text-sm text-success">
            YES {t.yes}
          </div>
          <div className="flex-1 rounded-lg bg-muted py-2 text-center font-label text-sm text-muted-foreground">
            NO 58¢
          </div>
        </div>
        <div className="mt-3 flex justify-between font-label text-xs">
          <span className="text-muted-foreground">Payout if correct</span>
          <span className="text-success">{t.payout} tokens</span>
        </div>
        <div className="mt-1 flex justify-between font-label text-xs">
          <span className="text-muted-foreground">Profit</span>
          <span className="text-success">{t.profit} tokens</span>
        </div>
      </div>
    );
  }

  if ("result" in data && data.result) {
    const r = data.result;
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="font-label text-xs text-muted-foreground">Your position</p>
        <p className="font-display text-lg font-semibold">
          &quot;{r.word}&quot; · {r.shares} YES shares
        </p>
        <div className="mt-3 space-y-1.5 font-label text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cost basis</span>
            <span>{r.cost}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payout</span>
            <span>{r.payout}</span>
          </div>
          <div className="flex justify-between font-medium text-success">
            <span>Profit</span>
            <span>{r.profit}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/** Multi-step onboarding modal for app pages. */
export function HowItWorksModal({ open, onClose }: HowItWorksModalProps) {
  const [step, setStep] = useState(0);
  const trapRef = useFocusTrap<HTMLDivElement>(open);

  const reset = useCallback(() => setStep(0), []);

  useEffect(() => {
    if (!open) return;
    reset();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, reset]);

  if (!open) return null;

  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-label="Close how it works"
      />
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-it-works-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl animate-scale-in"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/15">
              <Info className="h-4 w-4 text-brand" />
            </span>
            <span className="font-label text-sm font-medium">How it works</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto px-5 py-4">
          <StepContent step={step} />
        </div>

        <div className="border-t border-border px-5 py-5">
          <p className="font-label text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2 id="how-it-works-title" className="mt-1 font-display text-xl font-bold">
            {current.title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{current.description}</p>

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === step ? "w-6 bg-brand" : "w-1.5 bg-muted-foreground/30",
                  )}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={() => (isLast ? onClose() : setStep((s) => s + 1))}
            >
              {isLast ? "Got it" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
