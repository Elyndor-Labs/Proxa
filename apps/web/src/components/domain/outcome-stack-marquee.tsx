"use client";

import type { OutcomeQuote } from "@/lib/format/odds";
import { OutcomeRow } from "@/components/domain/outcome-row";
import { cn } from "@/lib/utils";

interface OutcomeStackMarqueeProps {
  outcomes: OutcomeQuote[];
  compact?: boolean;
  /** Segment repeats for a seamless vertical loop. */
  loops?: number;
  className?: string;
}

/**
 * Vertical “whole box” marquee — entire outcome rows scroll as one stack
 * (reference: mentioned.market card body), even with only 2–3 items.
 */
export function OutcomeStackMarquee({
  outcomes,
  compact = false,
  loops = 3,
  className,
}: OutcomeStackMarqueeProps) {
  if (!outcomes.length) return null;

  const copies = Math.max(2, loops);

  return (
    <div
      className={cn(
        "outcome-stack-marquee",
        compact ? "outcome-stack-marquee--compact" : "outcome-stack-marquee--roomy",
        className,
      )}
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
              {outcomes.map((quote) => (
                <OutcomeRow key={`${copy}-${quote.label}`} quote={quote} compact={compact} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
