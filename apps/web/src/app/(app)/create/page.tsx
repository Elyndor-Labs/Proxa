import type { Metadata } from "next";
import { Suspense } from "react";
import { CreateMarketForm } from "@/features/create/create-market-form";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Launch Market",
  "Pick a fixture and candidate, then deploy on-chain.",
);

export default function CreatePage() {
  return (
    <Suspense fallback={<p className="px-6 py-10 text-sm text-muted-foreground">Loading launch wizard…</p>}>
      <CreateMarketForm />
    </Suspense>
  );
}
