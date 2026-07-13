"use client";

import type { MarketAccount } from "@proxa/sdk";
import { bucketChancePct, bucketPriceCents } from "@/lib/format/odds";
import type { MarketView } from "@/lib/proxa/market-view";
import { cn } from "@/lib/utils";

interface WordTradeTableProps {
  view: MarketView;
  account: MarketAccount;
  selectedBucket: number;
  onSelectBucket: (bucket: number) => void;
  disabled?: boolean;
}

/** Words list with chance % and trade buttons — mentioned.market style. */
export function WordTradeTable({
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
            <th>Word</th>
            <th>Chance</th>
            <th>Trade</th>
          </tr>
        </thead>
        <tbody>
          {view.bucketLabels.map((label, index) => {
            const chance = bucketChancePct(account, index);
            const priceCents = bucketPriceCents(account, index);
            const oppositeCents = isBinary ? bucketPriceCents(account, index === 0 ? 1 : 0) : 0;
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
                          Yes {priceCents}¢
                        </button>
                        <button
                          type="button"
                          className="word-btn-no"
                          disabled={disabled}
                          onClick={() => onSelectBucket(index === 0 ? 1 : 0)}
                        >
                          No {oppositeCents}¢
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
                        Trade · {priceCents}¢
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
