"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { pageTransition } from "@/lib/motion/transitions";

/** Fade + upward slide on route change (~200ms). */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={pageTransition.transition}
    >
      {children}
    </motion.div>
  );
}
