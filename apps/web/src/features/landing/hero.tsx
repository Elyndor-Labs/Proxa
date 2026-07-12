import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { launchAppLabel, MockDemoCta } from "@/features/landing/mock-demo-cta";
import { ProductMockup } from "@/features/landing/product-mockup";
import { siteConfig } from "@/config/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-[var(--container-padding)] py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/landing/hero-grid.svg"
          alt=""
          aria-hidden
          fill
          className="object-cover opacity-40"
          priority
        />
      </div>
      <div className="pointer-events-none absolute inset-0 animate-pulse-glow bg-[radial-gradient(ellipse_at_top,_var(--brand)_0%,_transparent_55%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <p className="animate-fade-in-up mb-4 font-label text-sm uppercase tracking-widest text-brand">
            On Solana
          </p>
          <h1 className="animate-fade-in-up-delay-1 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            The Future of Parametric <span className="text-brand">Betting is On-Chain.</span>
          </h1>
          <p className="animate-fade-in-up-delay-2 mx-auto mt-6 max-w-2xl text-lg text-muted-foreground lg:mx-0">
            {siteConfig.description} Lock USDC in escrow, bet on custom match conditions, and receive
            automatic payouts verified by Merkle proof.
          </p>
          <div className="animate-fade-in-up-delay-3 mt-8 flex flex-col items-center gap-4 lg:items-start">
            <MockDemoCta />
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Button variant="brand" size="lg" asChild>
                <Link href="/markets">
                  {launchAppLabel()}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/#how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="animate-fade-in-up-delay-2">
          <ProductMockup />
        </div>
      </div>
    </section>
  );
}
