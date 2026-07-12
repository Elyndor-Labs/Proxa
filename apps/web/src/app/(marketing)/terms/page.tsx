import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata("Terms of Service");

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-[var(--container-padding)] py-12 sm:px-6 lg:px-8">
      <PageHeader title="Terms of Service" description="Last updated July 2026" />
      <div className="prose prose-invert mt-8 max-w-none space-y-4 text-sm text-muted-foreground">
        <p>
          Proxa is experimental software for parametric prop-bet settlement on Solana. By using this
          application you acknowledge that on-chain transactions are irreversible and that you are
          solely responsible for wallet security and compliance with applicable laws in your jurisdiction.
        </p>
        <p>
          Markets are created and settled according to on-chain program rules. Proxa does not custody
          funds, guarantee outcomes, or provide financial advice. Use at your own risk.
        </p>
        <p>
          We may update these terms as the protocol evolves. Continued use of the app constitutes
          acceptance of the current terms.
        </p>
      </div>
    </article>
  );
}
