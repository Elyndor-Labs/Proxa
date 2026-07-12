import type { Metadata } from "next";
import { CtaSection } from "@/features/landing/cta";
import { FaqSection } from "@/features/landing/faq-section";
import { FeaturesSection } from "@/features/landing/features-section";
import { Hero } from "@/features/landing/hero";
import { ProductShowcase } from "@/features/landing/product-showcase";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Trade on What Gets Said",
  "Proxa — prediction markets for any form of media.",
);

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ProductShowcase />
      <FeaturesSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
