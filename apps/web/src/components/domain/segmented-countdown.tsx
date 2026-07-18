"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCountdownParts } from "@/hooks/use-countdown-parts";
import { pad2 } from "@/lib/format/countdown";
import { cn } from "@/lib/utils";

interface SegmentedCountdownProps {
  targetMs: number;
  className?: string;
  compact?: boolean;
}

function DigitGroup({ value, label }: { value: string; label: string }) {
  return (
    <div className="countdown-segment">
      <div className="countdown-segment__digits" aria-hidden>
        <AnimatePresence mode="popLayout" initial={false}>
          {value.split("").map((digit, i) => (
            <motion.span
              key={`${label}-${i}-${digit}`}
              className="countdown-segment__digit"
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {digit}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <span className="countdown-segment__label">{label}</span>
    </div>
  );
}

/** Boxed per-group countdown (0d 09h 24m 02s). */
export function SegmentedCountdown({ targetMs, className, compact }: SegmentedCountdownProps) {
  const parts = useCountdownParts(targetMs);

  if (parts.closed) {
    return (
      <span className={cn("countdown-segment countdown-segment--closed", className)}>Closed</span>
    );
  }

  const groups = compact
    ? [
        ...(parts.days > 0 ? [{ value: pad2(parts.days), label: "d" }] : []),
        { value: pad2(parts.hours), label: "h" },
        { value: pad2(parts.minutes), label: "m" },
      ]
    : [
        ...(parts.days > 0 ? [{ value: pad2(parts.days), label: "d" }] : []),
        { value: pad2(parts.hours), label: "h" },
        { value: pad2(parts.minutes), label: "m" },
        { value: pad2(parts.seconds), label: "s" },
      ];

  return (
    <div className={cn("countdown-segments", compact && "countdown-segments--compact", className)} role="timer">
      {groups.map((group) => (
        <DigitGroup key={group.label} value={group.value} label={group.label} />
      ))}
    </div>
  );
}
