import type { Metadata } from "next";
import { CreateMarketForm } from "@/features/create/create-market-form";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata("Create Market", "Launch a new parametric prop market on-chain.");

export default function CreatePage() {
  return <CreateMarketForm />;
}
