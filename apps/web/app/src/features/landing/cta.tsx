import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CtaSection() {
  return (
    <section className="px-[var(--container-padding)] py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-brand/30 bg-brand/5 p-8 text-center sm:p-12">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">The arena is open. Build your prop.</h2>
        <p className="mt-3 text-muted-foreground">Create custom parametric conditions or browse live markets.</p>
        <div className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
          <Input placeholder="Search for a market…" aria-label="Search markets" className="flex-1" />
          <Button variant="brand" asChild>
            <Link href="/markets">Build Prop</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
