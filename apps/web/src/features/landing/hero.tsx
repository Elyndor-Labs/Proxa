import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const SCROLLING_MARKETS = [
  { status: "LIVE", icon: "🎙️", title: "Joe Rogan #2210: Elon Musk", words: ["Mars 72¢", "simulation 58¢", "Neuralink 81¢"], traders: 847 },
  { status: "LIVE", icon: "🗣️", title: "Presidential Debate Night", words: ["tariffs 69¢", "border 85¢", "China 72¢"], traders: 4521 },
  { status: "LOCKED", icon: "💻", title: "Apple WWDC Keynote", words: ["AI 96¢", "Vision 71¢", "iPhone 89¢"], traders: 1402 },
  { status: "LIVE", icon: "🎧", title: "Diary of a CEO: Tell All", words: ["breakdown 52¢", "divorce 31¢", "billion 67¢"], traders: 438 },
  { status: "LIVE", icon: "🏀", title: "NBA Finals Game 7", words: ["overtime 37¢", "clutch 81¢", "triple-double 44¢"], traders: 3102 },
  { status: "FREE", icon: "🎬", title: "Oscars 2026 Ceremony", words: ["historic 55¢", "overdue 48¢", "Nolan 27¢"], traders: 958 },
] as const;

function MarketScrollCard({ market }: { market: (typeof SCROLLING_MARKETS)[number] }) {
  const isLive = market.status === "LIVE";
  const isFree = market.status === "FREE";

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span
          className={`rounded px-1.5 py-0.5 font-label text-[10px] font-semibold uppercase ${
            isLive ? "bg-success/15 text-success" : isFree ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground"
          }`}
        >
          {market.status}
        </span>
        <span className="text-lg">{market.icon}</span>
      </div>
      <h3 className="font-display text-sm font-semibold leading-snug">{market.title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {market.words.map((word) => (
          <span key={word} className="rounded-md bg-muted px-2 py-0.5 font-label text-xs text-muted-foreground">
            {word}
          </span>
        ))}
      </div>
      <p className="font-label text-xs text-muted-foreground">{market.traders.toLocaleString()} traders</p>
    </div>
  );
}

export function Hero() {
  const doubled = [...SCROLLING_MARKETS, ...SCROLLING_MARKETS];

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 overflow-hidden opacity-60">
        <div className="animate-marquee flex gap-4 px-4">
          {doubled.map((market, i) => (
            <MarketScrollCard key={`${market.title}-${i}`} market={market} />
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-[var(--content-max-width)] px-[var(--container-padding)] pt-32 pb-20 sm:px-6 sm:pt-40 sm:pb-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="animate-fade-in-up font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Trade on what gets said.
          </h1>
          <p className="animate-fade-in-up-delay-1 mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            {siteConfig.description}
          </p>
          <div className="animate-fade-in-up-delay-2 mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant="brand" size="lg" asChild>
              <Link href="/markets">
                Launch App
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="animate-fade-in-up-delay-3 mt-12 font-label text-xs text-muted-foreground">
            Scroll to see how it works ↓
          </p>
        </div>
      </div>
    </section>
  );
}
