"use client";

import type { MarketAccount } from "@proxa/sdk";
import { bucketChancePct, formatOdds } from "@/lib/format/odds";
import type { MarketView } from "@/lib/proxa/market-view";
import { cn } from "@/lib/utils";

interface WordTradeTableProps {
  view: MarketView;
  account: MarketAccount;
  selectedBucket: number;
  onSelectBucket: (bucket: number) => void;
  disabled?: boolean;
}

/** Outcome list with pool chance and estimated parimutuel payout odds. */
export function OutcomeTradeTable({
  view,
  account,
  selectedBucket,
  onSelectBucket,
  disabled,
}: WordTradeTableProps) {
  const isBinary = view.numBuckets === 2;

  return (
    <div className="surface overflow-hidden">
      <table className="words-table">
        <thead>
          <tr>
            <th>Outcome</th>
            <th>Pool share</th>
            <th>Back</th>
          </tr>
        </thead>
        <tbody>
          {view.bucketLabels.map((label, index) => {
            const chance = bucketChancePct(account, index);
            const odds = formatOdds(account, index);
            const oppositeBucket = index === 0 ? 1 : 0;
            const oppositeOdds = isBinary ? formatOdds(account, oppositeBucket) : "0.00";
            const isSelected = selectedBucket === index;

            return (
              <tr key={label} className="words-row" data-selected={isSelected}>
                <td>
                  <span className="word-label">{label}</span>
                </td>
                <td>
                  <span className="word-chance">{chance}%</span>
                </td>
                <td>
                  <div className="word-trade-btns">
                    {isBinary ? (
                      <>
                        <button
                          type="button"
                          className={cn("word-btn-yes", isSelected && "ring-1 ring-brand/40")}
                          disabled={disabled}
                          onClick={() => onSelectBucket(index)}
                        >
                          Yes {odds}x
                        </button>
                        <button
                          type="button"
                          className="word-btn-no"
                          disabled={disabled}
                          onClick={() => onSelectBucket(oppositeBucket)}
                        >
                          No {oppositeOdds}x
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className={cn(
                          "word-btn-back",
                          isSelected && "border-[var(--surface-border-hover)] bg-[rgba(74,222,128,0.1)]",
                        )}
                        disabled={disabled}
                        onClick={() => onSelectBucket(index)}
                      >
                        Back {odds}x
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
