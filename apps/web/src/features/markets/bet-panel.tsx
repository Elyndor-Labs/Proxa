"use client";

import { previewBet, toBaseUnits, type MarketAccount } from "@proxa/sdk";
import { motion } from "motion/react";
import { createElement, useMemo, useState } from "react";
import { WalletButton } from "@/components/domain/wallet-button";
import { marketCategoryIcon } from "@/lib/format/market-category";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useBetSlipStore } from "@/features/bet-slip/store";
import { usePlaceBet } from "@/hooks/use-place-bet";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { bucketPriceCents, formatStake } from "@/lib/format/odds";
import type { MarketView } from "@/lib/proxa/market-view";
import { STAKE_DECIMALS } from "@/lib/proxa/market-view";
import { cn } from "@/lib/utils";

const MAX_STAKE = 2;
const PRESETS = [0.25, 0.5, 0.75, 1] as const;

interface BetPanelProps {
  marketId: string;
  view: MarketView;
  account: MarketAccount;
  selectedBucket: number;
  onSelectBucket: (bucket: number) => void;
}

/** Sticky trading sidebar — Buy/Sell tabs, quick amounts, animated outcome toggles. */
export function BetPanel({ marketId, view, account, selectedBucket, onSelectBucket }: BetPanelProps) {
  const [amount, setAmount] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const { canTransact } = useProxaClient();
  const { connected } = useWalletAuth();
  const placeBet = usePlaceBet();
  const { addLeg, setOpen } = useBetSlipStore();

  const bucket = selectedBucket;
  const label = view.bucketLabels[bucket] ?? `Bucket ${bucket + 1}`;
  const yesCents = bucketPriceCents(account, bucket);
  const isBinary = view.numBuckets === 2;
  const disabled = !view.isOpen || placeBet.isPending;

  const amountNum = Number(amount) || 0;
  const remaining = Math.max(0, MAX_STAKE - amountNum);

  const preview = useMemo(
    () =>
      amount && !Number.isNaN(amountNum)
        ? previewBet(account, bucket, toBaseUnits(amount, STAKE_DECIMALS))
        : null,
    [account, amount, amountNum, bucket],
  );

  const applyPreset = (fraction: number) => {
    setAmount((MAX_STAKE * fraction).toFixed(2));
  };

  const handlePlaceBet = () => {
    placeBet.mutate({ marketId, bucket, amount }, { onSuccess: () => setAmount("") });
  };

  const handleAddToSlip = () => {
    addLeg({
      marketId,
      title: view.title,
      bucket,
      bucketLabel: label,
      amount,
    });
    setOpen(true);
  };

  return (
    <aside className="trade-card animate-slide-up-delay-1">
      <div className="trade-card__header">
        <span className="trade-card__icon" aria-hidden>
          {createElement(marketCategoryIcon(view.statLabel), {
            className: "h-5 w-5",
            strokeWidth: 1.75,
          })}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-bold">{label}</p>
          <p className="font-label text-xs text-text-secondary">Market #{marketId}</p>
        </div>
      </div>

      <div className="trade-info-banner">$2 max per position</div>

      <div className="trade-tabs px-5">
        <button
          type="button"
          className="trade-tab"
          data-active={side === "buy"}
          onClick={() => setSide("buy")}
        >
          Buy
        </button>
        <button type="button" className="trade-tab" disabled title="Coming soon">
          Sell
        </button>
      </div>

      <div className="trade-card__body">
        {isBinary ? (
          <div className="trade-binary">
            <motion.button
              type="button"
              className="trade-btn-yes"
              data-selected={bucket === 0}
              disabled={disabled}
              onClick={() => onSelectBucket(0)}
              whileTap={{ scale: 0.97 }}
            >
              <span className="trade-btn-label">Yes {bucketPriceCents(account, 0)}¢</span>
            </motion.button>
            <motion.button
              type="button"
              className="trade-btn-no"
              data-selected={bucket === 1}
              disabled={disabled}
              onClick={() => onSelectBucket(1)}
              whileTap={{ scale: 0.97 }}
            >
              <span className="trade-btn-label">No {bucketPriceCents(account, 1)}¢</span>
            </motion.button>
          </div>
        ) : (
          <p className="font-label text-sm text-text-secondary">
            Backing <span className="font-semibold text-foreground">{label}</span> at{" "}
            <span className="font-bold text-brand">{yesCents}¢</span>
          </p>
        )}

        <div className="trade-amount-block">
          <label htmlFor="trade-amount" className="trade-amount-label">
            USDC to spend
          </label>
          <input
            id="trade-amount"
            type="number"
            min="0"
            max={MAX_STAKE}
            step="0.01"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={disabled}
            className="trade-amount-input"
          />
          <p className="trade-stake-remaining">
            <strong>${remaining.toFixed(2)}</strong> left of ${MAX_STAKE.toFixed(2)} max
          </p>
        </div>

        <div className="trade-presets">
          {PRESETS.map((fraction) => (
            <button
              key={fraction}
              type="button"
              className={cn(
                "trade-preset",
                amountNum === MAX_STAKE * fraction && "border-brand/40 bg-brand/10 text-brand",
              )}
              disabled={disabled}
              onClick={() => applyPreset(fraction)}
            >
              {fraction === 1 ? "Max" : `${fraction * 100}%`}
            </button>
          ))}
        </div>

        {preview && preview.projectedPayout.gtn(0) && (
          <div className="rounded-[var(--radius-control)] border border-[var(--surface-border)] bg-black/20 px-4 py-3">
            <p className="font-label text-xs text-text-secondary">Payout if {label} wins</p>
            <p className="mt-0.5 font-display text-xl font-bold text-brand">
              $<AnimatedNumber value={Number(formatStake(preview.projectedPayout))} />
            </p>
          </div>
        )}

        {!view.isOpen && (
          <p className="text-center font-label text-xs text-text-secondary">
            This market is no longer accepting bets.
          </p>
        )}

        {!connected || !canTransact ? (
          <div className="w-full">
            <WalletButton size="lg" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="trade-cta trade-cta--brand cta-primary"
              disabled={disabled || !amount || amountNum <= 0}
              onClick={handlePlaceBet}
            >
              {placeBet.isPending ? "Confirming…" : "Place trade"}
            </button>
            <button
              type="button"
              className="trade-cta"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "var(--foreground)",
                border: "1px solid var(--surface-border)",
              }}
              disabled={!amount || amountNum <= 0}
              onClick={handleAddToSlip}
            >
              Add to slip
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
