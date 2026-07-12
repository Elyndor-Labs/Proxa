import type { Metadata } from "next";
import { DashboardView } from "@/features/dashboard/dashboard-view";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata("Dashboard", "Protocol TVL, wallet performance, and live stats.");


export default function DashboardPage() {
  return <DashboardView />;
}
