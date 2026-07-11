import type { Metadata } from "next";
import { RequireWallet } from "@/components/auth/require-wallet";
import { PageHeader } from "@/components/layout/page-header";
import { PositionList } from "@/features/portfolio/position-list";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata("Portfolio", "View and claim your open positions.");

export default function PortfolioPage() {
  return (
    <>
      <PageHeader title="Portfolio" description="Your active positions and claimable winnings." />
      <RequireWallet>
        <PositionList />
      </RequireWallet>
    </>
  );
}
