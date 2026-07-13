import type { Metadata } from "next";
import { CtaSection } from "@/features/landing/cta";
import { FaqSection } from "@/features/landing/faq-section";
import { FeaturesSection } from "@/features/landing/features-section";
import { Hero } from "@/features/landing/hero";
import { LandingSectionReveal } from "@/features/landing/landing-section-reveal";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Live Sports Prediction Markets",
  "Proxa - TXOdds-powered sports markets settled on Solana.",
);

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Hero />
      <LandingSectionReveal delay={0.05}>
        <FeaturesSection />
      </LandingSectionReveal>
      <LandingSectionReveal delay={0.1}>
        <FaqSection />
      </LandingSectionReveal>
      <LandingSectionReveal delay={0.15}>
        <CtaSection />
      </LandingSectionReveal>
    </div>
  );
}

