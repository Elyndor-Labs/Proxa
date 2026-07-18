import type { Metadata } from "next";
import { RequireWallet } from "@/components/auth/require-wallet";
import { PortfolioPageContent } from "@/features/portfolio/portfolio-page-content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Portfolio",
  "Your positions and trade history.",
);

export default function PortfolioPage() {
  return (
    <RequireWallet>
      <PortfolioPageContent />
    </RequireWallet>
  );
}
