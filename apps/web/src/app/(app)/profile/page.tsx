import type { Metadata } from "next";
import { RequireWallet } from "@/components/auth/require-wallet";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileView } from "@/features/profile/profile-view";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Profile",
  "Wallet details and protocol access.",
);

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Profile" description="Wallet details and protocol access." />
      <RequireWallet>
        <ProfileView />
      </RequireWallet>
    </>
  );
}
