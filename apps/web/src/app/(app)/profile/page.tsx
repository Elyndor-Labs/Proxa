import type { Metadata } from "next";
import { RequireWallet } from "@/components/auth/require-wallet";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileView } from "@/features/profile/profile-view";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata("Profile", "Wallet and protocol account details.");

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Profile" description="Wallet, login, network, and protocol access details." />
      <RequireWallet>
        <ProfileView />
      </RequireWallet>
    </>
  );
}
