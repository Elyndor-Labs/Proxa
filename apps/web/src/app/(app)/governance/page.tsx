import type { Metadata } from "next";
import { GovernanceView } from "@/features/governance/governance-view";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata("Governance", "Protocol configuration and authority parameters.");

export default function GovernancePage() {
  return <GovernanceView />;
}
