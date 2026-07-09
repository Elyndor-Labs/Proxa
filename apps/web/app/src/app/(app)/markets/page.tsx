import { MarketCard } from "@/components/domain/market-card";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { featuredMarkets } from "@/features/landing/data";

const filters = ["All Feeds", "Soccer", "Basketball", "Football", "Baseball", "Esports"] as const;

export default function MarketsPage() {
  return (
    <>
      <PageHeader title="Live Markets" description="Browse parametric props across all active feeds." />

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((filter, index) => (
          <Badge key={filter} variant={index === 0 ? "brand" : "outline"} className="cursor-pointer px-3 py-1">
            {filter}
          </Badge>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {featuredMarkets.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>
    </>
  );
}
