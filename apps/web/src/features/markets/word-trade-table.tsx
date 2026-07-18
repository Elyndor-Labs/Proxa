"use client";

import type { MarketAccount } from "@proxa/sdk";
import { Percent } from "lucide-react";
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

interface WordTradeRowProps {
  label: string;
  index: number;
  chance: number;
  priceCents: number;
  oppositeCents: number;
  isBinary: boolean;
  isSelected: boolean;
  selectedBucket: number;
  disabled?: boolean;
  onSelectBucket: (bucket: number) => void;
}

function WordTradeRow({
  label,
  index,
  chance,
  priceCents,
  oppositeCents,
  isBinary,
  isSelected,
  selectedBucket,
  disabled,
  onSelectBucket,
}: WordTradeRowProps) {
  return (
    <div className="words-row words-row-grid" data-selected={isSelected}>
      <div className="words-row-grid__word">
        <span className="word-label">{label}</span>
        <div className="probability-bar mt-2 max-w-[10rem]">
          <div
            className={cn(
              "probability-bar__fill",
              isBinary && index === 0 && "probability-bar__fill--positive",
              isBinary && index === 1 && "probability-bar__fill--negative",
              !isBinary && "probability-bar__fill--neutral",
            )}
            style={{ width: `${Math.max(chance, 2)}%` }}
          />
        </div>
      </div>
      <span className="word-chance">{chance}%</span>
      <div className="word-trade-btns">
        {isBinary ? (
          <>
            <button
              type="button"
              className="word-btn-yes"
              data-selected={selectedBucket === index}
              disabled={disabled}
              onClick={() => onSelectBucket(index)}
            >
              Yes {priceCents}¢
            </button>
            <button
              type="button"
              className="word-btn-no"
              data-selected={selectedBucket === (index === 0 ? 1 : 0)}
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
            Trade {priceCents}¢
          </button>
        )}
      </div>
    </div>
  );
}

/** Outcome list — vertical whole-row marquee (Word / Chance / Trade). */
export function WordTradeTable({
  view,
  account,
  selectedBucket,
  onSelectBucket,
  disabled,
}: WordTradeTableProps) {
  const isBinary = view.numBuckets === 2;
  const copies = 3;

  return (
    <div className="surface overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[var(--surface-border)] px-5 py-3">
        <Percent className="h-4 w-4 text-brand" aria-hidden />
        <p className="section-label mb-0">Outcomes</p>
      </div>

      <div className="words-row-grid words-row-grid--head" aria-hidden>
        <span>Word</span>
        <span>Chance</span>
        <span className="text-right">Trade</span>
      </div>

      <div
        className="outcome-stack-marquee outcome-stack-marquee--table"
        style={{ ["--marquee-copies" as string]: copies }}
      >
        <div className="outcome-stack-marquee__viewport">
          <div className="outcome-stack-marquee__track">
            {Array.from({ length: copies }, (_, copy) => (
              <div
                key={copy}
                className="outcome-stack-marquee__segment"
                aria-hidden={copy > 0 ? true : undefined}
              >
                {view.bucketLabels.map((label, index) => {
                  const chance = bucketChancePct(account, index);
                  const priceCents = bucketPriceCents(account, index);
                  const oppositeCents = isBinary
                    ? bucketPriceCents(account, index === 0 ? 1 : 0)
                    : 0;

                  return (
                    <WordTradeRow
                      key={`${copy}-${label}`}
                      label={label}
                      index={index}
                      chance={chance}
                      priceCents={priceCents}
                      oppositeCents={oppositeCents}
                      isBinary={isBinary}
                      isSelected={selectedBucket === index}
                      selectedBucket={selectedBucket}
                      disabled={disabled}
                      onSelectBucket={onSelectBucket}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
