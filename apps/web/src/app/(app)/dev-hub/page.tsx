import type { Metadata } from "next";
import { DevHubView } from "@/features/dev-hub/dev-hub-view";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata("Dev Hub", "SDK docs, integration guides, and code examples.");

export default function DevHubPage() {
  return <DevHubView />;
}
