import type { Metadata } from "next";
import { CtaSection } from "@/features/landing/cta";
import { FaqSection } from "@/features/landing/faq-section";
import { FeaturesSection } from "@/features/landing/features-section";
import { Hero } from "@/features/landing/hero";
import { LandingSectionReveal } from "@/features/landing/landing-section-reveal";
import { ProductShowcase } from "@/features/landing/product-showcase";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Trade on What Gets Said",
  "Proxa — prediction markets for any form of media.",
);

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Hero />
      <ProductShowcase />
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
