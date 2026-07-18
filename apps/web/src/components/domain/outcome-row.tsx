import type { OutcomeQuote } from "@/lib/format/odds";
import { cn } from "@/lib/utils";

interface OutcomeRowProps {
  quote: OutcomeQuote;
  compact?: boolean;
  className?: string;
  "aria-hidden"?: boolean;
}

/** Single outcome pill — static label; list motion lives on OutcomeStackMarquee. */
export function OutcomeRow({ quote, compact, className, ...rest }: OutcomeRowProps) {
  return (
    <div
      className={cn("outcome-display", compact && "outcome-display--compact", className)}
      {...rest}
    >
      <div className="outcome-display__row">
        <span className="outcome-display__label">{quote.label}</span>
        <div className="outcome-display__pricing">
          <span className="outcome-display__price">
            {quote.odds === "—" ? "—" : `${quote.odds} · ${quote.cents}¢`}
          </span>
          <span className="outcome-display__pct">{quote.probability}%</span>
        </div>
      </div>
      <div className="probability-bar" aria-hidden>
        <div
          className="probability-bar__fill probability-bar__fill--neutral"
          style={{ width: `${Math.max(quote.probability, 2)}%` }}
        />
      </div>
    </div>
  );
}
