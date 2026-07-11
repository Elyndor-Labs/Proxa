import { LineChart, Shield, Wallet, Zap } from "lucide-react";
import { FeaturedMarketsPreview } from "@/features/landing/featured-markets-preview";

const steps = [
  {
    icon: Wallet,
    title: "Connect Wallet",
    description: "Link Phantom or any Solana wallet. No account signup required.",
  },
  {
    icon: LineChart,
    title: "Choose Market",
    description: "Browse live parametric props across soccer, basketball, and more.",
  },
  {
    icon: Zap,
    title: "Place Bet",
    description: "Lock USDC in on-chain escrow. Winners are paid automatically post-match.",
  },
] as const;

const STEP_DELAYS = ["animate-fade-in-up", "animate-fade-in-up-delay-1", "animate-fade-in-up-delay-2"] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border bg-card px-[var(--container-padding)] py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center font-display text-3xl font-bold">Precision Workflow</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Three steps from wallet to payout — fully trustless, no middleman.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`${STEP_DELAYS[index] ?? "animate-fade-in-up"} rounded-xl border border-border bg-background p-6 text-center`}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <step.icon className="h-6 w-6 text-brand" />
              </div>
              <p className="font-label text-xs text-muted-foreground">Step {index + 1}</p>
              <h3 className="mt-1 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedMarkets() {
  return (
    <section className="px-[var(--container-padding)] py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-3xl font-bold">Live Markets Overview</h2>
        <p className="mt-2 text-muted-foreground">A preview of what awaits inside the app.</p>
        <FeaturedMarketsPreview />
      </div>
    </section>
  );
}

export function TrustSection() {
  return (
    <section className="border-y border-border bg-card px-[var(--container-padding)] py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-bold">
            Cryptographically Guaranteed <span className="text-brand">Execution</span>
          </h2>
          <ul className="mt-6 space-y-4">
            {[
              "Automated payouts via on-chain escrow PDAs",
              "TxLINE oracle Merkle proof verification",
              "Permissionless settlement — no trusted server",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-muted-foreground">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-background p-6 font-mono text-sm">
          <p className="text-secondary">{"// settle_prop verification"}</p>
          <p className="mt-2 text-muted-foreground">verify_proof(merkle_root, proof[], leaf)</p>
          <p className="text-brand">→ validates TxLINE signature</p>
          <p className="text-muted-foreground">→ resolves condition (true/false)</p>
          <p className="text-muted-foreground">→ distributes USDC to winners</p>
        </div>
      </div>
    </section>
  );
}
