"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import GradientGlowFade from "@/components/ui/graident-glow";

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative overflow-hidden px-[var(--container-padding)] py-24 sm:px-6 lg:px-8">
      <GradientGlowFade className="pointer-events-none absolute inset-0 opacity-60" />
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] as const }}
        className="relative mx-auto max-w-3xl"
      >
        <div className="landing-cta-card overflow-hidden rounded-3xl border border-brand/20 bg-card/80 p-10 text-center backdrop-blur-md sm:p-14">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(74,222,128,0.15), transparent 70%)",
            }}
          />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
              Markets are live.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg font-medium text-muted-foreground">
              Pick your words. Trade against the crowd. Win when you&apos;re right.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button variant="brand" size="lg" className="h-12 px-8 text-base font-bold" asChild>
                <Link href="/markets">
                  Launch App
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base font-bold" asChild>
                <Link href="/markets">Browse markets</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
