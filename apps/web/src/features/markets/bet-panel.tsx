"use client";

import { previewBet, toBaseUnits, type MarketAccount } from "@proxa/sdk";
import { useState } from "react";
import { WalletButton } from "@/components/domain/wallet-button";
import { useBetSlipStore } from "@/features/bet-slip/store";
import { usePlaceBet } from "@/hooks/use-place-bet";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { useConfig } from "@/hooks/use-protocol-stats";
import { useStakeTokenBalance } from "@/hooks/use-token-balance";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { formatOdds } from "@/lib/format/odds";
import { formatStake } from "@/lib/format/odds";
import type { MarketView } from "@/lib/proxa/market-view";
import { STAKE_DECIMALS } from "@/lib/proxa/market-view";
import { formatStakeTokenLabel } from "@/lib/proxa/stake-token";

const MAX_STAKE = 100;
const PRESETS = [0.25, 0.5, 0.75, 1] as const;

interface BetPanelProps {
  marketId: string;
  view: MarketView;
  account: MarketAccount;
  selectedBucket: number;
  onSelectBucket: (bucket: number) => void;
  tradingBlockedMessage?: string;
}

/** Sticky trading sidebar — mentioned.market style. */
export function BetPanel({
  marketId,
  view,
  account,
  selectedBucket,
  onSelectBucket,
  tradingBlockedMessage,
}: BetPanelProps) {
  const [amount, setAmount] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const { canTransact } = useProxaClient();
  const { connected } = useWalletAuth();
  const { data: cash } = useStakeTokenBalance();
  const { data: config } = useConfig();
  const placeBet = usePlaceBet();
  const { addLeg, setOpen } = useBetSlipStore();

  const bucket = selectedBucket;
  const label = view.bucketLabels[bucket] ?? `Bucket ${bucket + 1}`;
  const estimatedOdds = formatOdds(account, bucket);
  const isBinary = view.numBuckets === 2;
  const disabled = !view.isOpen || placeBet.isPending || Boolean(tradingBlockedMessage);
  const yesLabel = view.bucketLabels[0] ?? "Outcome 1";
  const noLabel = view.bucketLabels[1] ?? "Outcome 2";
  const stakeTokenLabel = formatStakeTokenLabel((config?.stakeMint ?? account.stakeMint).toBase58());
  const amountNumber = Number(amount);
  const isValidStake =
    Number.isFinite(amountNumber) && amountNumber > 0 && amountNumber <= MAX_STAKE;
  const insufficientBalance = Boolean(isValidStake && cash && amountNumber > cash.amount);
  const maxSpendable = Math.max(0, Math.min(MAX_STAKE, cash?.amount ?? MAX_STAKE));
  const actionsDisabled = disabled || !isValidStake || insufficientBalance;

  const preview = isValidStake
    ? previewBet(account, bucket, toBaseUnits(amount, STAKE_DECIMALS))
    : null;

  const applyPreset = (fraction: number) => {
    setAmount((maxSpendable * fraction).toFixed(2));
  };

  const handlePlaceBet = () => {
    if (!isValidStake || insufficientBalance) return;
    placeBet.mutate({ marketId, bucket, amount }, { onSuccess: () => setAmount("") });
  };

  const handleAddToSlip = () => {
    if (!isValidStake) return;
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
          {label.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-bold">{label}</p>
          <p className="font-label text-xs text-muted-foreground">Market #{marketId}</p>
        </div>
      </div>

      <div className="trade-info-banner">${MAX_STAKE.toFixed(2)} max per position</div>

      {tradingBlockedMessage ? (
        <p className="mx-5 mt-4 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 font-label text-xs text-foreground">
          {tradingBlockedMessage}
        </p>
      ) : null}

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
            <button
              type="button"
              className="trade-btn-yes"
              data-selected={bucket === 0}
              disabled={disabled}
              onClick={() => onSelectBucket(0)}
            >
              <span className="trade-btn-label">{yesLabel}</span>
              <span className="trade-btn-price">{formatOdds(account, 0)}x</span>
            </button>
            <button
              type="button"
              className="trade-btn-no"
              data-selected={bucket === 1}
              disabled={disabled}
              onClick={() => onSelectBucket(1)}
            >
              <span className="trade-btn-label">{noLabel}</span>
              <span className="trade-btn-price">{formatOdds(account, 1)}x</span>
            </button>
          </div>
        ) : (
          <p className="font-label text-sm text-muted-foreground">
            Backing <span className="font-semibold text-foreground">{label}</span> at estimated{" "}
            <span className="font-bold text-brand">{estimatedOdds}x</span>
          </p>
        )}

        <div className="trade-amount-block">
          <label htmlFor="trade-amount" className="trade-amount-label">
            {stakeTokenLabel} to spend
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
          <p className="trade-amount-hint">
            ${MAX_STAKE.toFixed(2)} max · {cash ? `${cash.label} available · ` : ""}
            Estimated payout odds: {estimatedOdds}x
          </p>
        </div>

        <div className="trade-presets">
          {PRESETS.map((fraction) => (
            <button
              key={fraction}
              type="button"
              className="trade-preset"
              disabled={disabled}
              onClick={() => applyPreset(fraction)}
            >
              {fraction === 1 ? "Max" : `${fraction * 100}%`}
            </button>
          ))}
        </div>

        {preview && preview.projectedPayout.gtn(0) && (
          <div className="rounded-lg border border-[var(--surface-border)] bg-black/20 px-4 py-3">
            <p className="font-label text-xs text-muted-foreground">Payout if {label} wins</p>
            <p className="mt-0.5 font-display text-xl font-bold text-brand">
              {formatStake(preview.projectedPayout)} {stakeTokenLabel}
            </p>
          </div>
        )}

        {!view.isOpen && (
          <p className="text-center font-label text-xs text-muted-foreground">
            This market is no longer accepting bets.
          </p>
        )}
        {connected && insufficientBalance && (
          <p className="text-center font-label text-xs text-destructive">
            Not enough {stakeTokenLabel}. Available: {cash?.label ?? "$0.00"}.
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
              className="trade-cta trade-cta--brand"
              disabled={actionsDisabled}
              onClick={handlePlaceBet}
            >
              {placeBet.isPending ? "Confirming…" : "Place trade"}
            </button>
            <button
              type="button"
              className="trade-cta"
              style={{ background: "rgba(255,255,255,0.08)", color: "var(--foreground)", border: "1px solid var(--surface-border)" }}
              disabled={actionsDisabled}
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
