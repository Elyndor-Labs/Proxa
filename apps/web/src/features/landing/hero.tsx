"use client";

import Link from "next/link";
import { ArrowRight, Radio, TrendingUp, Users, Zap } from "lucide-react";
import { motion } from "motion/react";
import GradientGlowFade from "@/components/ui/graident-glow";
import { CanvasText } from "@/components/ui/canvas-text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";

const SCROLLING_MARKETS = [
  { status: "LIVE", icon: "🎙️", title: "Joe Rogan #2210: Elon Musk", words: ["Mars 72¢", "simulation 58¢"], traders: 847 },
  { status: "LIVE", icon: "🗣️", title: "Presidential Debate Night", words: ["tariffs 69¢", "border 85¢"], traders: 4521 },
  { status: "LOCKED", icon: "💻", title: "Apple WWDC Keynote", words: ["AI 96¢", "Vision 71¢"], traders: 1402 },
  { status: "LIVE", icon: "🎧", title: "Diary of a CEO: Tell All", words: ["breakdown 52¢", "divorce 31¢"], traders: 438 },
  { status: "LIVE", icon: "🏀", title: "NBA Finals Game 7", words: ["overtime 37¢", "clutch 81¢"], traders: 3102 },
  { status: "FREE", icon: "🎬", title: "Oscars 2026 Ceremony", words: ["historic 55¢", "Nolan 27¢"], traders: 958 },
] as const;

const STATS = [
  { label: "Active traders", value: "12.4k+", icon: Users },
  { label: "Markets live", value: "180+", icon: Radio },
  { label: "Volume traded", value: "$2.1M", icon: TrendingUp },
  { label: "Avg. payout", value: "1.8×", icon: Zap },
] as const;

function MarketScrollCard({ market }: { market: (typeof SCROLLING_MARKETS)[number] }) {
  const isLive = market.status === "LIVE";
  const isFree = market.status === "FREE";

  return (
    <div className="landing-market-card group flex w-72 shrink-0 flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 backdrop-blur-sm transition-all duration-300 hover:border-brand/30 hover:shadow-[0_8px_32px_-8px_rgba(74,222,128,0.25)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-wide ${
              isLive
                ? "bg-success/15 text-success"
                : isFree
                  ? "bg-brand/15 text-brand"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {market.status}
          </span>
          <span className="text-lg">{market.icon}</span>
        </div>
        {isLive && (
          <span className="flex items-center gap-1 font-label text-[10px] font-semibold text-success">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            Live
          </span>
        )}
      </div>
      <h3 className="font-display text-sm font-bold leading-snug transition-colors group-hover:text-brand">
        {market.title}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {market.words.map((word) => (
          <span
            key={word}
            className="rounded-md border border-border/60 bg-muted/50 px-2 py-0.5 font-label text-xs font-medium text-muted-foreground"
          >
            {word}
          </span>
        ))}
      </div>
      <p className="font-label text-xs font-medium text-muted-foreground">
        {market.traders.toLocaleString()} traders
      </p>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function Hero() {
  const doubled = [...SCROLLING_MARKETS, ...SCROLLING_MARKETS];

  return (
    <section className="landing-hero relative overflow-hidden">
      <GradientGlowFade className="pointer-events-none absolute inset-0 z-0" />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(74,222,128,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)",
        }}
      />

      {/* Ticker */}
      <div className="relative z-10 border-b border-border/40 bg-background/40 py-3 backdrop-blur-md">
        <div className="animate-marquee flex gap-4 px-4">
          {doubled.map((market, i) => (
            <MarketScrollCard key={`${market.title}-${i}`} market={market} />
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[var(--content-max-width)] px-[var(--container-padding)] pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
            <Badge variant="brand" className="mb-6 px-3 py-1 font-label text-xs font-bold uppercase tracking-widest">
              Prediction markets · Live media
            </Badge>
          </motion.div>

          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="mb-6">
            <h1 className="sr-only">Trade on what gets said.</h1>
            <CanvasText
              text="Trade on what gets said."
              className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl"
              backgroundClassName="bg-background"
              colors={["#4ade80", "#22c55e", "#86efac", "#bbf7d0", "#16a34a"]}
              animationDuration={6}
              lineGap={8}
              curveIntensity={40}
            />
          </motion.div>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground sm:text-xl"
          >
            {siteConfig.description}
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Button variant="brand" size="lg" className="h-12 px-8 text-base font-bold" asChild>
              <Link href="/markets">
                Launch App
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" className="h-12 px-8 text-base font-bold" asChild>
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </motion.div>

          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
          >
            {STATS.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="landing-stat-tile rounded-2xl border border-border/60 bg-card/50 px-4 py-5 backdrop-blur-sm transition-all duration-300 hover:border-brand/25 hover:bg-card/80"
              >
                <Icon className="mx-auto mb-2 h-4 w-4 text-brand" />
                <p className="font-display text-xl font-bold tabular-nums sm:text-2xl">{value}</p>
                <p className="mt-1 font-label text-xs font-medium text-muted-foreground">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
