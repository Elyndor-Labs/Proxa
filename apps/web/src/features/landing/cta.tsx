import Link from "next/link";
import { Button } from "@/components/ui/button";
import { launchAppLabel } from "@/features/landing/mock-demo-cta";

export function CtaSection() {
  return (
    <section className="px-[var(--container-padding)] py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Markets are live.</h2>
        <p className="mt-3 text-lg text-muted-foreground">Now you know how it works. Jump in.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button variant="brand" size="lg" asChild>
            <Link href="/markets">{launchAppLabel()}</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/leaderboard">View Leaderboard</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
