"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CtaSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/markets?q=${encodeURIComponent(q)}` : "/markets");
  };

  return (
    <section className="px-[var(--container-padding)] py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-brand/30 bg-brand/5 p-8 text-center sm:p-12">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">The arena is open. Build your prop.</h2>
        <p className="mt-3 text-muted-foreground">Create custom parametric conditions or browse live markets.</p>
        <form onSubmit={handleSearch} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Search for a market…"
            aria-label="Search markets"
            className="flex-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" variant="brand">
            Search
          </Button>
        </form>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/create">Create Market</Link>
        </Button>
      </div>
    </section>
  );
}
