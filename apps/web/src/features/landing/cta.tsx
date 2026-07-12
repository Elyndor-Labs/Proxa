"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="px-[var(--container-padding)] py-28 sm:px-6 lg:px-8">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] as const }}
        className="relative landing-shell"
      >
        <div className="landing-cta-card overflow-hidden rounded-3xl border border-border/60 bg-card p-12 text-center sm:p-16">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Markets are live.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg font-medium text-muted-foreground">
            Pick your words. Trade against the crowd. Win when you&apos;re right.
          </p>
          <div className="mt-12 flex justify-center">
            <Button variant="brand" size="lg" className="h-12 px-10 text-base font-bold" asChild>
              <Link href="/markets">
                Explore Markets
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
