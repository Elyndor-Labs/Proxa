import type { Metadata } from "next";
import { CreateMarketForm } from "@/features/create/create-market-form";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata("Make Markets", "Create and launch new prediction markets.");

export default function CreatePage() {
  return <CreateMarketForm />;
}
