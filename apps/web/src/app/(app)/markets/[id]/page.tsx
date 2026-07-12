import type { Metadata } from "next";
import { MarketDetailView } from "@/features/markets/market-detail-view";
import { createPageMetadata } from "@/lib/metadata";

interface MarketDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MarketDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return createPageMetadata(`Market #${id}`, `View pool, odds, and place bets on market #${id}.`);
}

export default async function MarketDetailPage({ params }: MarketDetailPageProps) {
  const { id } = await params;
  return <MarketDetailView marketId={id} />;
}
