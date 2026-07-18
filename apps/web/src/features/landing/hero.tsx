"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { CanvasText } from "@/components/ui/canvas-text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivityTicker } from "@/features/activity/activity-ticker";
// import { MarketMarquee } from "@/features/landing/market-marquee";
import { siteConfig } from "@/config/site";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function Hero() {
  return (
    <section className="landing-hero relative overflow-hidden">
      {/* Card strip marquee — replaced by activity ticker for now
      <MarketMarquee />
      */}
      <ActivityTicker />

      <div className="landing-shell landing-hero-stage relative z-10 px-[var(--container-padding)]">
        <div className="w-full text-center">
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
            <Badge variant="brand" className="mb-6 px-4 py-1.5 font-label text-xs font-bold uppercase tracking-widest">
              Prediction markets - Live sports
            </Badge>
          </motion.div>

          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="mb-6 flex justify-center">
            <h1 className="sr-only">Trade on live match outcomes.</h1>
            <CanvasText
              text="Trade on live match outcomes."
              className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
              backgroundClassName="bg-background"
              colors={["#4ade80", "#22c55e", "#86efac", "#bbf7d0", "#16a34a"]}
              animationDuration={6}
              lineGap={7}
              lineWidth={2}
              curveIntensity={45}
            />
          </motion.div>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mx-auto max-w-lg text-base font-medium leading-relaxed text-muted-foreground sm:text-lg"
          >
            {siteConfig.description}
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-8 flex justify-center"
          >
            <Button variant="brand" size="lg" className="h-12 px-10 text-base font-bold" asChild>
              <Link href="/markets">
                Explore Markets
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
