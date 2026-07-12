const TRADE_FLOW_STEPS = [
  {
    step: 1,
    title: "Pick a market",
    description:
      "Every market is tied to a live event: a stream, a podcast, a tournament. Each one has a set of words you can trade on.",
    preview: "markets",
  },
  {
    step: 2,
    title: "Browse the words",
    description:
      "Each market has a list of words with live prices. YES means you think it'll be said. Prices move with the crowd.",
    preview: "words",
  },
  {
    step: 3,
    title: "Place your trade",
    description: "Pick YES or NO, enter your amount, and see exactly what you'll win before you confirm.",
    preview: "trade",
  },
  {
    step: 4,
    title: "Watch prices move",
    description:
      "Prices update in real time as the event unfolds. Sell anytime to lock in profit, or hold until resolution.",
    preview: "chart",
  },
  {
    step: 5,
    title: "Collect your winnings",
    description:
      "Event ends, transcript is checked. If your word was said and you held YES, you win. One click to claim.",
    preview: "claim",
  },
] as const;

function StepPreview({ type }: { type: (typeof TRADE_FLOW_STEPS)[number]["preview"] }) {
  if (type === "markets") {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: "🎮", title: "VCT Masters: Grand Final", status: "Open" },
          { icon: "🎙️", title: "Joe Rogan #2189", status: "Open" },
          { icon: "⚔️", title: "League Worlds: Semifinals", status: "Open" },
        ].map((m) => (
          <div key={m.title} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">{m.icon}</span>
              <span className="rounded bg-success/15 px-1.5 py-0.5 font-label text-[10px] text-success">{m.status}</span>
            </div>
            <p className="mt-2 font-display text-xs font-semibold">{m.title}</p>
            <div className="mt-2 space-y-1">
              {["GG 42¢", "nerf 35¢", "clutch 61¢"].map((w) => (
                <div key={w} className="flex justify-between font-label text-[10px] text-muted-foreground">
                  <span>{w.split(" ")[0]}</span>
                  <span>{w.split(" ")[1]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "words") {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-2 font-label text-xs text-muted-foreground">
          Words in this market · Click to trade
        </div>
        <table className="w-full font-label text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-2">Word</th>
              <th className="px-4 py-2">YES</th>
              <th className="px-4 py-2">NO</th>
              <th className="px-4 py-2">Volume</th>
            </tr>
          </thead>
          <tbody>
            {[
              { word: "GG", yes: "42¢", no: "58¢", vol: "2.1k" },
              { word: "nerf", yes: "35¢", no: "65¢", vol: "1.8k" },
              { word: "clutch", yes: "61¢", no: "39¢", vol: "3.2k" },
            ].map((row) => (
              <tr key={row.word} className="border-b border-border/50">
                <td className="px-4 py-2.5 font-medium">{row.word}</td>
                <td className="px-4 py-2.5 text-success">{row.yes}</td>
                <td className="px-4 py-2.5 text-destructive">{row.no}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{row.vol}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === "trade") {
    return (
      <div className="mx-auto max-w-sm rounded-xl border border-border bg-card p-5">
        <p className="font-label text-xs text-muted-foreground">Selected word</p>
        <p className="font-display text-lg font-semibold">&quot;GG&quot;</p>
        <div className="mt-4 flex gap-2">
          <button type="button" className="flex-1 rounded-lg bg-success/15 py-2 font-label text-sm text-success">
            YES 42¢
          </button>
          <button type="button" className="flex-1 rounded-lg bg-muted py-2 font-label text-sm text-muted-foreground">
            NO 58¢
          </button>
        </div>
        <div className="mt-4 space-y-2 font-label text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Payout if correct</span>
            <span className="text-success">116.2 tokens</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Profit</span>
            <span className="text-success">+66.2 tokens</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "chart") {
    return (
      <div className="mx-auto max-w-sm rounded-xl border border-border bg-card p-5">
        <p className="font-label text-xs text-muted-foreground">&quot;GG&quot; YES price</p>
        <p className="font-display text-2xl font-bold">
          32¢<span className="ml-1 text-sm text-success">▲</span>
        </p>
        <div className="mt-4 flex h-24 items-end gap-1">
          {[40, 55, 45, 60, 50, 65, 55, 32].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-brand/30" style={{ height: `${h}%` }} />
          ))}
        </div>
        <p className="mt-3 rounded-lg border border-brand/20 bg-brand/5 p-2 font-label text-xs text-muted-foreground">
          Pro tip: You can sell early if the price has gone up since you bought.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm rounded-xl border border-border bg-card p-5">
      <p className="font-label text-xs text-muted-foreground">Your position</p>
      <p className="font-display text-lg font-semibold">&quot;GG&quot; · 116.2 YES shares</p>
      <div className="mt-4 space-y-2 font-label text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Cost basis</span>
          <span>$50.00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Payout</span>
          <span>$116.20</span>
        </div>
        <div className="flex justify-between font-medium text-success">
          <span>Profit</span>
          <span>+$66.20 (+132%)</span>
        </div>
      </div>
      <p className="mt-4 text-center font-label text-sm text-brand">+$66.20 earned!</p>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border bg-card/50 px-[var(--container-padding)] py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[var(--content-max-width)]">
        {TRADE_FLOW_STEPS.map((step) => (
          <div key={step.step} className="mb-20 last:mb-0">
            <p className="font-label text-xs uppercase tracking-widest text-muted-foreground">
              The trade flow · {step.step} / {TRADE_FLOW_STEPS.length}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{step.title}</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">{step.description}</p>
            <div className="mt-8">
              <StepPreview type={step.preview} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
