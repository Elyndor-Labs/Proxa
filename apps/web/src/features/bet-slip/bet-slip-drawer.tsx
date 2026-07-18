"use client";

import Link from "next/link";
import { Trash2, X } from "lucide-react";
import { previewBet, toBaseUnits } from "@proxa/sdk";
import { useState } from "react";
import { TxActionFallback } from "@/components/domain/tx-action-fallback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBetSlipStore, type BetLeg } from "@/features/bet-slip/store";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useMarket } from "@/hooks/use-market";
import { usePlaceBets } from "@/hooks/use-place-bets";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { formatStake } from "@/lib/format/odds";
import { STAKE_DECIMALS } from "@/lib/proxa/market-view";
import { formatStakeTokenLabel } from "@/lib/proxa/stake-token";
import { cn } from "@/lib/utils";

/** Persistent multi-leg bet slip drawer across app routes. */
export function BetSlipDrawer() {
  const { legs, open, setOpen, updateLeg, removeLeg, clear } = useBetSlipStore();
  const { canTransact } = useProxaClient();
  const placeBets = usePlaceBets();
  const [placingAll, setPlacingAll] = useState(false);
  const trapRef = useFocusTrap<HTMLElement>(open);

  if (!open || legs.length === 0) return null;

  const validLegs = legs.filter((leg) => leg.amount && Number(leg.amount) > 0);
  const totalStake = validLegs.reduce((sum, leg) => sum + Number(leg.amount), 0);

  const handlePlaceAll = async () => {
    if (!validLegs.length) return;
    setPlacingAll(true);

    try {
      await placeBets.mutateAsync(
        validLegs.map((leg) => ({
          marketId: leg.marketId,
          bucket: leg.bucket,
          amount: leg.amount,
        })),
      );
      clear();
    } catch {
      // Error toast handled by mutation.
    } finally {
      setPlacingAll(false);
    }
  };

  const busy = placeBets.isPending || placingAll;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={() => setOpen(false)}
        aria-label="Close bet slip"
      />
      <aside
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Prop slip"
        className={cn(
          "fixed right-0 bottom-0 z-50 flex w-full flex-col border-t border-border bg-card shadow-xl md:bottom-auto md:top-[var(--header-height)] md:h-[calc(100dvh-var(--header-height))] md:w-96 md:border-t-0 md:border-l",
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-lg font-semibold">
            Prop Slip {legs.length > 1 ? `(${legs.length})` : ""}
          </h2>
          <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-3 overflow-auto p-4">
          {legs.map((leg) => (
            <BetSlipLegRow
              key={leg.id}
              leg={leg}
              busy={busy}
              onAmountChange={(amount) => updateLeg(leg.id, { amount })}
              onRemove={() => removeLeg(leg.id)}
            />
          ))}
        </div>

        <div className="space-y-3 border-t border-border p-4">
          <div className="space-y-1 font-label text-sm text-muted-foreground">
            <p>
              Total stake: <span className="font-medium text-foreground">${totalStake.toFixed(2)}</span>
            </p>
          </div>
          {canTransact ? (
            <Button
              variant="brand"
              className="w-full"
              size="lg"
              disabled={busy || validLegs.length === 0}
              onClick={handlePlaceAll}
            >
              {busy
                ? "Confirming…"
                : validLegs.length > 1
                  ? `Place ${validLegs.length} Bets`
                  : "Place Prop Bet"}
            </Button>
          ) : (
            <TxActionFallback size="lg" />
          )}
          <Button variant="ghost" size="sm" className="w-full" onClick={clear} disabled={busy}>
            Clear slip
          </Button>
        </div>
      </aside>
    </>
  );
}

function BetSlipLegRow({
  leg,
  busy,
  onAmountChange,
  onRemove,
}: {
  leg: BetLeg;
  busy: boolean;
  onAmountChange: (amount: string) => void;
  onRemove: () => void;
}) {
  const { data } = useMarket(leg.marketId);

  if (!data) {
    return <div className="h-24 animate-pulse rounded-lg bg-muted" />;
  }

  const { account, view } = data;
  const stakeTokenLabel = formatStakeTokenLabel(account.stakeMint.toBase58());
  const preview =
    leg.amount && !Number.isNaN(Number(leg.amount))
      ? previewBet(account, leg.bucket, toBaseUnits(leg.amount, STAKE_DECIMALS))
      : null;

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/markets/${leg.marketId}`} className="line-clamp-2 text-sm font-medium hover:text-brand">
            {leg.title || view.title}
          </Link>
          <p className="mt-1 font-label text-xs text-muted-foreground">
            {leg.bucketLabel || view.bucketLabels[leg.bucket]}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={onRemove}
          disabled={busy}
          aria-label="Remove bet"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 space-y-2">
        <label htmlFor={`slip-amount-${leg.id}`} className="font-label text-xs text-muted-foreground">
          Stake ({stakeTokenLabel})
        </label>
        <Input
          id={`slip-amount-${leg.id}`}
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={leg.amount}
          onChange={(e) => onAmountChange(e.target.value)}
          disabled={!view.isOpen || busy}
        />
      </div>

      {preview && preview.projectedPayout.gtn(0) && (
        <p className="mt-2 font-label text-xs text-muted-foreground">
          Payout: <span className="text-brand">{formatStake(preview.projectedPayout)} {stakeTokenLabel}</span>
        </p>
      )}
    </div>
  );
}
