import type { Metadata } from "next";
import { CtaSection } from "@/features/landing/cta";
import { Hero } from "@/features/landing/hero";
import { FeaturedMarkets, HowItWorks, TrustSection } from "@/features/landing/sections";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Trustless Parametric Props on Solana",
  "Proxa — trustless parametric prop-bet settlement on Solana.",
);

export default function LandingPage() {
  return (
    <>
      <Hero />
      <FeaturedMarkets />
      <HowItWorks />
      <TrustSection />
      <CtaSection />
    </>
  );
}
