import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Markets",
  "Browse and bet on live parametric props on Solana.",
);

export default function MarketsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
