"use client";

import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "What is Proxa?",
    a: "Proxa is a sports prediction market platform that turns TXOdds fixture data into Solana-settled markets.",
  },
  {
    q: "How do I place a trade?",
    a: "Connect your wallet, pick a market outcome, enter your stake token amount, and confirm. You'll see your potential payout before you submit.",
  },
  {
    q: "How are markets settled?",
    a: "When a match resolves, the oracle proof is checked against the market's stat key. Winning positions claim from the on-chain pool.",
  },
  {
    q: "Can I sell before the event ends?",
    a: "Yes. Prices move in real time as the event unfolds. You can sell your position anytime to lock in profit or cut losses.",
  },
  {
    q: "What's the difference between free and paid markets?",
    a: "Paid markets use the configured SPL stake mint and offer real payouts on correct predictions.",
  },
  {
    q: "Is this financial advice?",
    a: "No. Trading involves risk of loss. Only trade with funds you can afford to lose. Proxa is for entertainment and speculation on media events.",
  },
] as const;

export function FaqSection() {
  const [open, setOpen] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="px-[var(--container-padding)] py-24 sm:px-6 lg:px-8">
      <div ref={ref} className="landing-shell grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-brand">FAQ</p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Frequently
            <br />
            asked
            <br />
            questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="divide-y divide-border/60"
        >
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-start gap-4 py-5 text-left transition-colors hover:text-brand"
                  aria-expanded={isOpen}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all duration-200",
                      isOpen
                        ? "border-brand/40 bg-brand/10 text-brand"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                  <span className="font-display text-base font-bold sm:text-lg">{faq.q}</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 pl-10 text-sm font-medium leading-relaxed text-muted-foreground">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
