import type { Metadata } from "next";
import { AdminOpsView } from "@/features/admin/admin-ops-view";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Admin Operations",
  "Sync fixtures, review candidates, and prepare markets for launch.",
);

export default function AdminPage() {
  return <AdminOpsView />;
}
