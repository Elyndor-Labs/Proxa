"use client";

import { previewBet, toBaseUnits, type MarketAccount } from "@proxa/sdk";
import { useState } from "react";
import { WalletButton } from "@/components/domain/wallet-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBetSlipStore } from "@/features/bet-slip/store";
import { usePlaceBet } from "@/hooks/use-place-bet";
import { useProxaClient } from "@/hooks/use-proxa-client";
import type { MarketView } from "@/lib/proxa/market-view";
import { STAKE_DECIMALS } from "@/lib/proxa/market-view";
import { formatStake } from "@/lib/format/odds";
import { cn } from "@/lib/utils";

interface BetPanelProps {
  marketId: string;
  view: MarketView;
  account: MarketAccount;
}

/** Bucket selection, amount input, and bet placement for a single market. */
export function BetPanel({ marketId, view, account }: BetPanelProps) {
  const [bucket, setBucket] = useState(0);
  const [amount, setAmount] = useState("");
  const { canTransact } = useProxaClient();
  const placeBet = usePlaceBet();
  const { addLeg, setOpen } = useBetSlipStore();

  const preview =
    amount && !Number.isNaN(Number(amount))
      ? previewBet(account, bucket, toBaseUnits(amount, STAKE_DECIMALS))
      : null;

  const disabled = !view.isOpen || placeBet.isPending;

  const handlePlaceBet = () => {
    placeBet.mutate({ marketId, bucket, amount }, { onSuccess: () => setAmount("") });
  };

  const handleAddToSlip = () => {
    addLeg({
      marketId,
      title: view.title,
      bucket,
      bucketLabel: view.bucketLabels[bucket] ?? `Bucket ${bucket + 1}`,
      amount,
    });
    setOpen(true);
  };

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Prop Slip</CardTitle>
        <CardDescription>Select a bucket and stake amount in USDC. Add multiple legs to your slip.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {view.bucketLabels.map((label, index) => (
            <Button
              key={label}
              type="button"
              size="sm"
              variant={bucket === index ? "brand" : "outline"}
              onClick={() => setBucket(index)}
              disabled={disabled}
              className={cn("flex-1")}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <label htmlFor="stake-amount" className="font-label text-xs text-muted-foreground">
            Stake (USDC)
          </label>
          <Input
            id="stake-amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={disabled}
          />
        </div>

        {preview && preview.projectedPayout.gtn(0) && (
          <div className="rounded-lg border border-border bg-muted/50 p-3 font-label text-sm">
            <p className="text-muted-foreground">Projected payout if {view.bucketLabels[bucket]} wins</p>
            <p className="mt-1 font-display text-xl font-bold text-brand">
              ${formatStake(preview.projectedPayout)}
            </p>
          </div>
        )}

        {!view.isOpen && (
          <p className="font-label text-xs text-muted-foreground">This market is no longer accepting bets.</p>
        )}

        <div className="flex flex-col gap-2">
          {canTransact ? (
            <>
              <Button
                variant="brand"
                className="w-full"
                size="lg"
                disabled={disabled || !amount || Number(amount) <= 0}
                onClick={handlePlaceBet}
              >
                {placeBet.isPending ? "Confirming…" : "Place Prop Bet"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={!amount || Number(amount) <= 0}
                onClick={handleAddToSlip}
              >
                Add to Slip
              </Button>
            </>
          ) : (
            <div className="flex justify-center">
              <WalletButton size="lg" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
