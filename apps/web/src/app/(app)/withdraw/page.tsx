import type { Metadata } from "next";
import { RequireWallet } from "@/components/auth/require-wallet";
import { PageHeader } from "@/components/layout/page-header";
import { WithdrawView } from "@/features/withdraw/withdraw-view";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Withdraw",
  "Claim settled winnings from resolved markets.",
);

export default function WithdrawPage() {
  return (
    <>
      <PageHeader
        title="Withdraw"
        description="Claim settled winnings from your resolved positions."
      />
      <RequireWallet>
        <WithdrawView />
      </RequireWallet>
    </>
  );
}
