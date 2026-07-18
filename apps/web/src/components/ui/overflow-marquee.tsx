"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface OverflowMarqueeProps {
  text: string;
  className?: string;
  /** Always scroll, even when text fits. */
  always?: boolean;
  /** Repeated segments in the loop (≥2). */
  loops?: number;
}

/**
 * Contained marquee that keeps scrolling (pauses on hover).
 * Defaults to always-on with 3 segment copies for short labels like "Bucket 1".
 */
export function OverflowMarquee({
  text,
  className,
  always = true,
  loops = 3,
}: OverflowMarqueeProps) {
  const copies = Math.max(2, loops);
  const style = {
    ["--marquee-copies" as string]: copies,
  } as CSSProperties;

  return (
    <div
      className={cn("overflow-marquee", always && "overflow-marquee--active", className)}
      title={text}
      style={style}
    >
      <span className="overflow-marquee__run">
        {Array.from({ length: copies }, (_, i) => (
          <span key={i} className="overflow-marquee__seg" aria-hidden={i > 0 ? true : undefined}>
            {text}
          </span>
        ))}
      </span>
    </div>
  );
}
