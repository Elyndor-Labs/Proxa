"use client";

import { animate } from "motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  className?: string;
}

/** Quick count-up/down tween for live balances and prices. */
export function AnimatedNumber({
  value,
  format = (v) => v.toFixed(2),
  className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    const controls = animate(previous.current, value, {
      duration: 0.4,
      ease: "easeOut",
      onUpdate: (v) => {
        previous.current = v;
        setDisplay(v);
      },
    });
    return () => controls.stop();
  }, [value]);

  return <span className={cn("tabular-nums", className)}>{format(display)}</span>;
}
