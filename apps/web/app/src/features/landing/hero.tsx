import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-[var(--container-padding)] py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--brand)_0%,_transparent_50%)] opacity-10" />

      <div className="relative mx-auto max-w-4xl text-center">
        <p className="mb-4 font-label text-sm uppercase tracking-widest text-brand">On Solana</p>
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          The Future of Parametric{" "}
          <span className="text-brand">Betting is On-Chain.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          {siteConfig.description} Lock USDC in escrow, bet on custom match conditions, and receive
          automatic payouts verified by Merkle proof.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button variant="brand" size="lg" asChild>
            <Link href="/markets">
              Launch App
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/#how-it-works">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
