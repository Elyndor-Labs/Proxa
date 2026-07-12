"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { BarChart3, MessageSquareQuote, Shield, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: MessageSquareQuote,
    title: "Word-level markets",
    description:
      "Every event has a set of words. Trade YES if you think it'll be said, NO if it won't. Prices move in real time.",
    accent: "from-brand/20 to-transparent",
  },
  {
    icon: Zap,
    title: "Instant settlement",
    description:
      "Transcripts are verified on-chain. Winners claim payouts in one click — no waiting, no manual review.",
    accent: "from-success/15 to-transparent",
  },
  {
    icon: BarChart3,
    title: "Live price charts",
    description:
      "Watch odds shift as the event unfolds. Sell early to lock profit or hold until resolution.",
    accent: "from-warning/10 to-transparent",
  },
  {
    icon: Shield,
    title: "On-chain security",
    description:
      "Merkle proofs and oracle verification. Your positions and payouts are transparent and auditable.",
    accent: "from-brand/10 to-transparent",
  },
] as const;

const STEPS = [
  { n: "01", title: "Pick a market", desc: "Choose a live event — stream, podcast, or match." },
  { n: "02", title: "Trade a word", desc: "Buy YES or NO on any word in the market." },
  { n: "03", title: "Watch it move", desc: "Prices update live as the crowd reacts." },
  { n: "04", title: "Claim winnings", desc: "Transcript settles. Winners collect instantly." },
] as const;

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
      className="landing-feature-card group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-8 backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-card"
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />
      <div className="relative">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 transition-colors group-hover:border-brand/40 group-hover:bg-brand/15">
          <Icon className="h-5 w-5 text-brand" />
        </div>
        <h3 className="font-display text-lg font-bold">{feature.title}</h3>
        <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const stepsRef = useRef<HTMLDivElement>(null);
  const stepsInView = useInView(stepsRef, { once: true, margin: "-60px" });

  return (
    <>
      <section className="px-[var(--container-padding)] pb-20 pt-10 sm:px-6 sm:pt-12 lg:px-8">
        <div className="landing-shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-brand">
              Why Proxa
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Built for live moments.
            </h2>
            <p className="mt-4 text-base font-medium text-muted-foreground">
              Not another generic prediction UI. Real markets tied to real events, with the tools traders
              actually need.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="px-[var(--container-padding)] pb-20 pt-8 sm:px-6 lg:px-8"
      >
        <div className="landing-shell">
          <div className="mb-12 max-w-xl">
            <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-brand">
              How it works
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Four steps to your first trade.
            </h2>
          </div>

          <div ref={stepsRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 20 }}
                animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                className="landing-step-card group min-h-[11rem] rounded-2xl border border-border/60 bg-card/80 p-8 transition-all duration-300 hover:border-border hover:bg-card"
              >
                <span className="font-display text-3xl font-bold text-brand/40 transition-colors group-hover:text-brand/70">
                  {step.n}
                </span>
                <h3 className="mt-3 font-display text-base font-bold">{step.title}</h3>
                <p className="mt-2 text-sm font-medium text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
