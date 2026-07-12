import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata("Privacy Policy");

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-[var(--container-padding)] py-12 sm:px-6 lg:px-8">
      <PageHeader title="Privacy Policy" description="Last updated July 2026" />
      <div className="prose prose-invert mt-8 max-w-none space-y-4 text-sm text-muted-foreground">
        <p>
          Proxa is a non-custodial web application. We do not collect passwords or store private keys.
          When you connect a wallet, your public key is used locally to fetch on-chain data and sign
          transactions in your browser.
        </p>
        <p>
          RPC providers (e.g. Helius, public Solana endpoints) may log IP addresses and request
          metadata when your browser queries the network. Review your RPC provider&apos;s privacy policy
          if you use a dedicated endpoint.
        </p>
        <p>
          We do not sell personal data. Analytics or error monitoring may be added in the future with
          notice in an updated policy.
        </p>
      </div>
    </article>
  );
}
