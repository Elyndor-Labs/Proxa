import type { Metadata } from "next";
import { RequireWallet } from "@/components/auth/require-wallet";
import { ProfileView } from "@/features/profile/profile-view";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Profile",
  "Wallet, login, network, and protocol access details.",
);

export default function ProfilePage() {
  return (
    <RequireWallet>
      <ProfileView />
    </RequireWallet>
  );
}
