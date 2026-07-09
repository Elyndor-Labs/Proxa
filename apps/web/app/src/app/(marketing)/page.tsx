import { CtaSection } from "@/features/landing/cta";
import { Hero } from "@/features/landing/hero";
import { FeaturedMarkets, HowItWorks, TrustSection } from "@/features/landing/sections";

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
