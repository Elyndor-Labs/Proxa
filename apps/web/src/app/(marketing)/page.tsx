import type { Metadata } from "next";
import { CtaSection } from "@/features/landing/cta";
import { Hero } from "@/features/landing/hero";
import { CompeteSection, HowItWorks, TwoWaysSection } from "@/features/landing/sections";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Trade on What Gets Said",
  "Proxa — prediction markets for any form of media.",
);

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <CompeteSection />
      <TwoWaysSection />
      <CtaSection />
    </>
  );
}
