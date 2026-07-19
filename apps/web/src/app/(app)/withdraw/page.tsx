import type { Metadata } from "next";
import { RequireWallet } from "@/components/auth/require-wallet";
import { WithdrawView } from "@/features/withdraw/withdraw-view";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Withdraw",
  "Claim settled winnings from resolved markets.",
);

export default function WithdrawPage() {
  return (
    <RequireWallet>
      <WithdrawView />
    </RequireWallet>
  );
}
