import type { Metadata } from "next";
import { FixtureMarketsView } from "@/features/fixture/fixture-markets-view";
import { createPageMetadata } from "@/lib/metadata";

interface FixturePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: FixturePageProps): Promise<Metadata> {
  const { id } = await params;
  return createPageMetadata(`Fixture #${id}`, `All Proxa markets for fixture #${id}.`);
}

export default async function FixturePage({ params }: FixturePageProps) {
  const { id } = await params;
  return <FixtureMarketsView fixtureId={id} />;
}
