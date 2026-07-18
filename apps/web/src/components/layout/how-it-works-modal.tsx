"use client";

import { Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Pick a Market",
    description:
      "Every market is tied to a live match — goals, cards, corners, and more. Each has outcomes you can trade on.",
    markets: [
      { icon: "⚽", title: "Fixture #18257865 · P1 Goals", words: ["Over 2.5 61¢", "Under 2.5 39¢"] },
      { icon: "🟨", title: "Fixture #18143850 · P1 Yellow Cards", words: ["Bucket 1 33¢", "Bucket 2 28¢"] },
      { icon: "🚩", title: "Fixture #18237038 · P1 Corners", words: ["Yes 42¢", "No 58¢"] },
    ],
  },
  {
    title: "Browse the Outcomes",
    description:
      "Each market has outcomes with live prices. YES means you think it hits. Prices move as volume comes in.",
    words: [
      { word: "Over 2.5", yes: "61¢", no: "39¢", vol: "3.2k" },
      { word: "Under 2.5", yes: "39¢", no: "61¢", vol: "2.4k" },
      { word: "Exactly 2", yes: "22¢", no: "78¢", vol: "1.1k" },
    ],
  },
  {
    title: "Place Your Trade",
    description: "Pick YES or NO, enter your USDC amount, and see exactly what you'll win before you confirm.",
    trade: { word: "Over 2.5", yes: "61¢", no: "39¢", payout: "1.64", profit: "+0.64" },
  },
  {
    title: "Collect Your Winnings",
    description:
      "The match settles via oracle data. If your outcome hit and you held YES, you win. One click to claim.",
    result: {
      word: "Over 2.5",
      shares: "1.64",
      cost: "$1.00",
      payout: "$1.64",
      profit: "+$0.64 (+64%)",
    },
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
                    {market.words.map((w) => (
                      <span key={w} className="font-label text-[10px] text-muted-foreground">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
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
              <th className="px-3 py-2 text-left">Outcome</th>
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
        <p className="font-label text-xs text-muted-foreground">Selected outcome</p>
        <p className="font-display text-lg font-semibold">{t.word}</p>
        <div className="mt-3 flex gap-2">
          <div className="flex-1 rounded-lg bg-success/15 py-2 text-center font-label text-sm text-success">
            YES {t.yes}
          </div>
          <div className="flex-1 rounded-lg bg-muted py-2 text-center font-label text-sm text-muted-foreground">
            NO {t.no}
          </div>
        </div>
        <div className="mt-3 flex justify-between font-label text-xs">
          <span className="text-muted-foreground">Payout if correct</span>
          <span className="text-success">{t.payout} USDC</span>
        </div>
        <div className="mt-1 flex justify-between font-label text-xs">
          <span className="text-muted-foreground">Profit</span>
          <span className="text-success">{t.profit} USDC</span>
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
          {r.word} · {r.shares} YES shares
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
  if (!open) return null;

  return <HowItWorksDialog onClose={onClose} />;
}

function HowItWorksDialog({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const trapRef = useFocusTrap<HTMLDivElement>(true);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

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
