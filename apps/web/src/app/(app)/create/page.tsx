import type { Metadata } from "next";
import { CreateMarketForm } from "@/features/create/create-market-form";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata("Admin Market Launch", "Launch reviewed markets on-chain.");

export default function CreatePage() {
  return <CreateMarketForm />;
}
